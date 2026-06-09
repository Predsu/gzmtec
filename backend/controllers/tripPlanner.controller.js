const axios = require('axios');
const deviationOperationsModel = require('../models/deviationOperations.model');
const sdipService = require('../services/sdip.service'); // Import serwisu SDIP

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
`; //

const tripPlannerController = {
    searchRoute: async (req, res) => {
        const { fromLat, fromLon, toLat, toLon, date, time } = req.query; //

        if (!fromLat || !fromLon || !toLat || !toLon || !date || !time) { //
            return res.status(400).json({ 
                message: "(fromLat, fromLon, toLat, toLon, date, time) are required." 
            });
        }

        try {
            const otpEndpoint = `http://${process.env.JVM_HOST}:${process.env.JVM_PORT}/otp/routers/default/index/graphql`; //

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
            }); //

            const itineraries = otpResponse.data.data?.plan?.itineraries || []; //

            // Pobieramy aktualne pojazdy z SDIP GZM raz dla całego wyszukiwania
            let activeVehicles = [];
            try {
                activeVehicles = await sdipService.getActiveVehiclesAll(); //
                if (!Array.isArray(activeVehicles)) activeVehicles = []; //
            } catch (sdipErr) {
                console.error("Nie udało się pobrać danych Live z SDIP GZM:", sdipErr.message); //
            }

            for (const itinerary of itineraries) { //
                if (!itinerary.legs) continue; //

                for (const leg of itinerary.legs) { //
                    try {
                        if (leg.mode === 'WALK') continue; //

                        const lineLabel = leg.route?.shortName; //
                        const fullGtfsId = leg.from?.stop?.gtfsId; //

                        if (lineLabel && fullGtfsId) { //
                            const stopId = fullGtfsId.split(':').pop(); //
                            
                            // 1. DEKLARACJA ZMIENNYCH (Szeroki zasięg)
                            let predictedDeviation = 0;
                            let samplesCount = 0;
                            let samplesList = []; // Definiujemy na początku pętli leg, aby uniknąć ReferenceError
                            let isLive = false;

                            // 2. LOGIKA WALIDACJI CZASU RZECZYWISTEGO (LIVE)
                            const now = new Date();
                            
                            // Pobranie aktualnej daty w formacie YYYY-MM-DD w lokalnej strefie czasowej
                            const currentIsoDate = now.getFullYear() + '-' + 
                                                   String(now.getMonth() + 1).padStart(2, '0') + '-' + 
                                                   String(now.getDate()).padStart(2, '0');

                            // Sprawdzenie czy użytkownik szuka połączenia na dzisiaj
                            const isSearchingForToday = (date === currentIsoDate);

                            // Okno tolerancji dla statusu LIVE:
                            // Autobus ma odjechać w ciągu najbliższych 15 minut lub odjechał maksymalnie 5 minut temu
                            const currentTimeMs = now.getTime();
                            const toleranceBeforeMs = 5 * 60 * 1000;  // 5 min w przeszłość
                            const toleranceAfterMs = 15 * 60 * 1000;  // 15 min w przyszłość

                            const isTimeCloseToNow = (leg.startTime >= (currentTimeMs - toleranceBeforeMs)) && 
                                                     (leg.startTime <= (currentTimeMs + toleranceAfterMs));

                            // 3. PRÓBA DOPASOWANIA KURSU LIVE
                            // Pojazd z SDIP jest LIVE tylko wtedy, gdy wyszukiwanie dotyczy dzisiejszego kursu o obecnej godzinie
                            if (isSearchingForToday && isTimeCloseToNow) {
                                const liveVehicle = activeVehicles.find(v => 
                                    String(v?.lineLabel) === String(lineLabel) && 
                                    String(v?.nextStop?.id) === String(stopId)
                                ); //

                                if (liveVehicle) {
                                    const rawDev = liveVehicle?.nextStop?.deviation; //
                                    const normalizedDev = String(rawDev || "0 min"); //
                                    const parsedLiveDev = parseInt(normalizedDev, 10); //
                                    
                                    predictedDeviation = Number.isNaN(parsedLiveDev) ? 0 : parsedLiveDev; //
                                    isLive = true; //
                                    console.log(`[LIVE GZM] Znaleziono aktywny pojazd linii ${lineLabel} na przystanku ${stopId}. Odchylenie live: ${predictedDeviation} min`); //
                                }
                            }

                            // 4. MODEL HISTORYCZNY (Gdy brak pojazdu live lub kurs dotyczy innej godziny/dnia)
                            if (!isLive) {
                                try {
                                    const startTimeDate = new Date(leg.startTime); //
                                    const secondsSinceMidnight = (startTimeDate.getHours() * 3600) + (startTimeDate.getMinutes() * 60) + startTimeDate.getSeconds(); //
                                    const tolerance = 1800; //
                                    const weekday = startTimeDate.toLocaleString('en-US', { weekday: 'long' }); //

                                    console.log(`=== calculating history for ${lineLabel} at stop ${stopId} ===`); //
                                    
                                    // Przypisanie do zmiennej zadeklarowanej wyżej
                                    samplesList = await deviationOperationsModel.getAvgDeviationByLineStopTime(lineLabel, stopId, secondsSinceMidnight, tolerance, weekday); //
                                    samplesCount = samplesList.length; //

                                    if (samplesCount > 0) {
                                        const logSum = samplesList.reduce((sum, row) => sum + Math.log(row.deviation + 1), 0); //
                                        const logAverage = logSum / samplesCount; //
                                        predictedDeviation = Math.ceil(logAverage); //
                                        console.log(`counted estimated deviation: ${predictedDeviation} min`); //
                                    }
                                } catch (dbError) {
                                    console.error("TripPlanner DB ERR: ", dbError.message); //
                                }
                            }

                            // 5. ASYGNACJA DANYCH DO ZWRACANEGO OBIEKTU LEG
                            leg.predictedDeviationMinutes = predictedDeviation; //
                            leg.predictedSamplesCount = samplesCount; //
                            leg.predictedSamplesData = samplesList; // Przekazanie pełnej listy próbek (zawsze zdefiniowane)
                            leg.expectedStartTime = leg.startTime + (predictedDeviation * 60 * 1000); //
                            leg.isLive = isLive; //
                            
                            console.log(`=== finished for ${lineLabel} (Live: ${isLive}) ===\n`); //
                        }
                    } catch (innerError) {
                        console.error("TripPlanner ERR: ", innerError.message); //
                    }
                }
            }

            res.status(200).json(itineraries); //

        } catch (error) {
            console.error("TripPlanner ERR: ", error.response?.data || error.message); //
            res.status(500).json({ 
                message: "OpenTripPlanner communication ERR: ", 
                error: error.message 
            }); //
        }
    }
};

module.exports = tripPlannerController; //