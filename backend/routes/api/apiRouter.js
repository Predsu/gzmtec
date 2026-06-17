const express = require("express")
const router = express.Router()
const deviationOperationsController = require('../../controllers/deviationOperations.controller')
const tripPlannerController = require('../../controllers/tripPlanner.controller')
const apiStatusController = require("../../controllers/apiStatus.controller")
const sdipService = require('../../services/sdip.service')

router.use('/deviations/estimate', deviationOperationsController.estimateDeviation)
router.use('/trip/search', tripPlannerController.searchRoute)
router.use('/status', apiStatusController.apiStatus)

router.get('/stops', async (req, res) => {
    try {
        const stops = await sdipService.getAllStops();
        res.status(200).json(stops);
    } catch (error) {
        console.error("Błąd pobierania przystanków dla autocomplete:", error.message);
        res.status(500).json({ message: "Błąd serwisu SDIP" });
    }
});

router.get('/stops/:id/departures', async (req, res) => {
    try {
        const stopId = req.params.id;
        // 1. Pobieramy surowe dane odjazdów z SDIP GZM
        const sdipData = await sdipService.getDepartures(stopId);

        // Zakładamy strukturę SDIP: zazwyczaj zwraca tablicę obiektów w polu passages lub bezpośrednio tablicę
        // Dostosuj mapowanie (np. sdipData.passages) jeśli struktura ZTM tego wymaga
        const rawPassages = Array.isArray(sdipData) ? sdipData : (sdipData.passages || []);

        const now = new Date();
        const secondsSinceMidnight = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        
        // Pobieramy nazwę dnia tygodnia dla Twojego modelu bazy danych
        const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Europe/Warsaw' }).format(now);

        const mappedDepartures = await Promise.all(rawPassages.map(async (passage) => {
            // Przykładowe mapowanie pól z oficjalnego SDIP GZM:
            // lineLabel/line, direction, minutesLeft/countdown lub czas podany jako string
            const lineLabel = passage.line || passage.lineLabel || "---";
            const direction = passage.direction || "Kierunek nieznany";
            
            // Sprawdzenie czy odjazd jest LIVE (GPS) czy tylko rozkładowy (SCHEDULED)
            const isLive = passage.isLive ?? (passage.status === 'LIVE' || passage.realTime === true);
            let minutesLeft = passage.minutesLeft ?? passage.countdown ?? 0;

            // Integracja GZMTEC: Jeśli pojazd jedzie tylko według rozkładu (brak GPS), 
            // sprawdzamy historyczne opóźnienia w bazie danych dla tej linii i przystanku!
            if (!isLive) {
                try {
                    const samplesList = await deviationOperationsModel.getAvgDeviationByLineStopTime(
                        lineLabel, stopId, secondsSinceMidnight, 1800, weekday
                    );
                    if (samplesList && samplesList.length > 0) {
                        const logSum = samplesList.reduce((sum, row) => sum + Math.log(row.deviation + 1), 0);
                        const logAverage = logSum / samplesList.length;
                        const predictedDeviation = Math.round(Math.exp(logAverage) - 1);
                        
                        // Korygujemy czas pasażerowi na bazie statystyk GZMTEC
                        minutesLeft += predictedDeviation;
                    }
                } catch (dbErr) {
                    console.error("GZMTEC DB Error w tablicy odjazdów:", dbErr.message);
                }
            }

            return {
                lineLabel,
                direction,
                minutesLeft: minutesLeft < 0 ? 0 : minutesLeft,
                actualTime: passage.actualTime || passage.time || "",
                isLive: isLive
            };
        }));

        res.status(200).json(mappedDepartures);
    } catch (error) {
        console.error("Błąd generowania wirtualnej tablicy odjazdów GZMTEC:", error.message);
        res.status(500).json({ message: "Błąd serwisu SDIP/Bazy danych przy pobieraniu odjazdów" });
    }
});

module.exports = router;