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
                message: "Wszystkie parametry (fromLat, fromLon, toLat, toLon, date, time) są wymagane." 
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
                console.error("Błędy walidacji schematu GraphQL:", otpResponse.data.errors);
                return res.status(400).json({ message: "Błąd zapytania do silnika OTP2", errors: otpResponse.data.errors });
            }

            const itineraries = otpResponse.data?.data?.plan?.itineraries;

            if (!itineraries || itineraries.length === 0) {
                return res.status(404).json({ message: "Nie znaleziono połączeń dla podanych kryteriów." });
            }

            const itinerary = itineraries[0];

            for (let leg of itinerary.legs) {
                if (leg.mode === 'BUS' || leg.mode === 'TRAM') {
                    
                    const lineLabel = leg.route?.shortName;
                    const fullStopId = leg.from.stop?.gtfsId || "";
                    
                    const stopId = fullStopId.includes(':') ? fullStopId.split(':')[1] : fullStopId;
                    
                    const timestamp = Math.floor(leg.startTime / 1000);
                    
                    const weekday = new Date(leg.startTime).toLocaleDateString('en-US', { weekday: 'long' });
                    
                    const tolerance = 3600;

                    let predictedDeviation = 0;
                    let samplesCount = 0;

                    try {
                        const samplesList = await deviationOperationsModel.getAvgDeviationByLineStopTime(
                            lineLabel, 
                            stopId, 
                            timestamp, 
                            tolerance, 
                            weekday
                        );

                        samplesCount = samplesList.length;

                        if (samplesCount > 0) {
                            const logSum = samplesList.reduce((sum, row) => sum + Math.log(row.deviation + 1), 0);
                            const logAverage = logSum / samplesCount;
                            predictedDeviation = Math.round(Math.exp(logAverage) - 1);
                        }
                    } catch (dbError) {
                        console.error(`Błąd bazy danych dla linii ${lineLabel} (przystanek: ${stopId}):`, dbError.message);
                    }

                    leg.predictedDeviationSeconds = predictedDeviation;
                    leg.predictedSamplesCount = samplesCount;
                    leg.expectedStartTime = leg.startTime + (predictedDeviation * 1000);
                }
            }

            res.status(200).json(itinerary);

        } catch (error) {
            console.error("Błąd krytyczny TripPlanner:", error.response?.data || error.message);
            res.status(500).json({ 
                message: "Błąd komunikacji z procesem OpenTripPlanner 2.", 
                error: error.message 
            });
        }
    }
};

module.exports = tripPlannerController;