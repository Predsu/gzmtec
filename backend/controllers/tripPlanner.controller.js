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
            const otpEndpoint = `http://${process.env.JVM_HOST}:${process.env.JVM_PORT}/otp/routers/default/index/graphql`;

            const otpResponse = await axios.post(otpEndpoint, {
                query: OTP2_GTFS_GRAPHQL_QUERY,
                variables: {
                    fromLat: parseFloat(fromLat),
                    fromLon: parseFloat(fromLon),
                    toLat: parseFloat(toLat),
                    toLon: parseFloat(toLon),
                    date,
                    time
                }
            });

            const itineraries = otpResponse.data.data?.plan?.itineraries || [];

            for (const itinerary of itineraries) {
                if (!itinerary.legs) continue;

                for (const leg of itinerary.legs) {
                    try {
                        if (leg.mode === 'WALK') continue;

                        const lineLabel = leg.route?.shortName;
                        const fullGtfsId = leg.from?.stop?.gtfsId;
                        let predictedDeviation = 0;
                        let samplesCount = 0;

                        if (lineLabel && fullGtfsId) {
                            try {
                                const stopId = fullGtfsId.split(':').pop();
                                const startTimeDate = new Date(leg.startTime);
                                const secondsSinceMidnight = (startTimeDate.getHours() * 3600) + (startTimeDate.getMinutes() * 60) + startTimeDate.getSeconds();
                                const tolerance = 1800;
                                const weekday = startTimeDate.toLocaleString('en-US', { weekday: 'long' });

                                console.log(`=== calculating for ${lineLabel} at stop ${stopId} ===`);
                                const samplesList = await deviationOperationsModel.getAvgDeviationByLineStopTime(lineLabel, stopId, secondsSinceMidnight, tolerance, weekday);
                                
                                samplesCount = samplesList.length;

                                if (samplesCount > 0) {
                                    const logSum = samplesList.reduce((sum, row) => sum + Math.log(row.deviation + 1), 0);
                                    const logAverage = logSum / samplesCount;
                                    predictedDeviation = Math.ceil(logAverage);
                                    console.log(`counted estimated deviation: ${predictedDeviation} min`);
                                }
                            } catch (dbError) {
                                console.error("TripPlanner ERR: ", dbError.message);
                            }

                            leg.predictedDeviationMinutes = predictedDeviation;
                            leg.predictedSamplesCount = samplesCount;
                            leg.expectedStartTime = leg.startTime + (predictedDeviation * 60 * 1000);
                            
                            console.log(`=== finished for ${lineLabel} ===\n`);
                        }
                    } catch (innerError) {
                        console.error("TripPlanner ERR: ", innerError.message);
                    }
                }
            }

            res.status(200).json(itineraries);

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