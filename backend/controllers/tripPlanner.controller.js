const axios = require('axios');
const deviationOperationsModel = require('../models/deviationOperations.model');

const OTP2_GTFS_GRAPHQL_QUERY = `
  query PlanTransitRoute($fromLat: Float!, $fromLon: Float!, $toLat: Float!, $toLon: Float!, $date: String!, $time: String!) {
    plan(
      from: { lat: $fromLat, lon: $fromLon }
      to: { lat: $toLat, lon: $toLon }
      date: $date
      time: $time
    ) {
      itineraries {
        legs {
          mode
          duration
          startTime
          endTime
          route {
            shortName
          }
          from {
            name
            stop {
              gtfsId
            }
          }
          to {
            name
          }
        }
      }
    }
  }
`;

const tripPlannerController = {
    searchRoute: async (req, res) => {
        const { fromLat, fromLon, toLat, toLon, date, time } = req.query;

        if (!fromLat || !fromLon || !toLat || !toLon || !date || !time) {
            return res.status(400).json({ 
                message: "(fromLat, fromLon, toLat, toLon, date, time) are required." 
            });
        }

        try {
            const otpEndpoint = 'http://localhost:8890/otp/routers/default/index/graphql';

            const otpResponse = await axios.post(otpEndpoint, {
                query: OTP2_GTFS_GRAPHQL_QUERY,
                variables: {
                    fromLat: Number(fromLat),
                    fromLon: Number(fromLon),
                    toLat: Number(toLat),
                    toLon: Number(toLon),
                    date: date,
                    time: time
                }
            }, {
                headers: { 
                    'Content-Type': 'application/json',
                    'Accept': 'application/json'
                }
            });

            if (otpResponse.data.errors) {
                console.error("GraphQL validation ERR:", otpResponse.data.errors);
                return res.status(400).json({ message: "OTP2 query ERR: ", errors: otpResponse.data.errors });
            }

            const itineraries = otpResponse.data?.data?.plan?.itineraries;

            if (!itineraries || itineraries.length === 0) {
                return res.status(404).json({ message: "no connections found for this input" });
            }

            const itinerary = itineraries[0];

            for (let leg of itinerary.legs) {
                if (leg.mode === 'BUS' || leg.mode === 'TRAM') {
                    
                    try {
                        const lineLabel = leg.route?.shortName; 
                        const fullStopId = leg.from.stop?.gtfsId || ""; 
                        const stopId = fullStopId.includes(':') ? fullStopId.split(':')[1] : fullStopId; 
                        
                        if (!leg.startTime) continue; 

                        const dateInPoland = new Date(Number(leg.startTime));
                        const weekday = dateInPoland.toLocaleDateString('en-US', { 
                            weekday: 'long', 
                            timeZone: 'Europe/Warsaw' 
                        });

                        const hours = dateInPoland.getHours();
                        const minutes = dateInPoland.getMinutes();
                        const seconds = dateInPoland.getSeconds();
                        const secondsSinceMidnight = (hours * 3600) + (minutes * 60) + seconds;

                        const tolerance = 3600; 
                        let predictedDeviation = 0;
                        let samplesCount = 0;

                        console.log(`\n=== Processing data for ${lineLabel} ===`);
                        console.log(`entry data: weekday = ${weekday}, secondsSinceMidnight = ${secondsSinceMidnight}, stopId = ${stopId}`);

                        try {
                            console.log(`sent query to db`);
                            
                            const samplesList = await deviationOperationsModel.getAvgDeviationByLineStopTime(
                                lineLabel, 
                                stopId, 
                                secondsSinceMidnight, 
                                tolerance, 
                                weekday
                            );

                            console.log(`db responded with samples:`, samplesList ? samplesList.length : 0);

                            samplesCount = samplesList ? samplesList.length : 0;

                            if (samplesCount > 0) {
                                const logSum = samplesList.reduce((sum, row) => sum + Math.log(row.deviation + 1), 0);
                                const logAverage = logSum / samplesCount;
                                predictedDeviation = Math.round(Math.exp(logAverage) - 1);
                                console.log(`counted estimated deviation: ${predictedDeviation}`);
                            }
                        } catch (dbError) {
                            console.error("TripPlanner ERR: ", dbError.message);
                        }

                        leg.predictedDeviationSeconds = predictedDeviation;
                        leg.predictedSamplesCount = samplesCount;
                        leg.expectedStartTime = leg.startTime + (predictedDeviation * 1000);
                        
                        console.log(`=== finished for ${lineLabel} ===\n`);

                    } catch (innerError) {
                        console.error("TripPlanner ERR: ", innerError.message);
                    }
                }
            }

            res.status(200).json(itinerary);

        } catch (error) {
            console.error("TripPlanner ERR: ", error.response?.data || error.message);
            res.status(500).json({ 
                message: "OpenTripPlanner communication ERR: ", 
                error: error.message 
            });
        }
    }
};

module.exports = tripPlannerController;