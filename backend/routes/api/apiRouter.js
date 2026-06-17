const express = require("express")
const router = express.Router()
const cheerio = require("cheerio");
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
        
        const htmlData = await sdipService.getDepartures(stopId);

        const $ = cheerio.load(htmlData);
        const parsedDepartures = [];

        $(".departure").each((index, element) => {
            const departureDiv = $(element);
            
            const classAttr = departureDiv.attr("class") || "";
            const isLive = classAttr.includes("status-1") || classAttr.includes("live");

            const lineLabel = departureDiv.find(".line").text().trim() || "---";
            const direction = departureDiv.find(".destination").text().trim() || "Kierunek nieznany";
            const timeText = departureDiv.find(".time").text().trim();

            let minutesLeft = 0;
            let actualTime = "";

            if (timeText.toLowerCase().includes("min")) {
                minutesLeft = parseInt(timeText.replace(/[^0-9]/g, ""), 10) || 0;
                
                const d = new Date();
                d.setMinutes(d.getMinutes() + minutesLeft);
                actualTime = d.toLocaleTimeString("pl-PL", { hour: "2-digit", minute: "2-digit" });
            } else if (timeText.includes(":")) {
                actualTime = timeText;
                
                const now = new Date();
                const [hours, minutes] = timeText.split(":").map(Number);
                const departureDate = new Date();
                departureDate.setHours(hours, minutes, 0, 0);

                if (departureDate < now && (now.getHours() > 20 && hours < 4)) {
                    departureDate.setDate(departureDate.getDate() + 1);
                }

                const diffMs = departureDate.getTime() - now.getTime();
                minutesLeft = Math.max(0, Math.round(diffMs / 60000));
            } else {
                actualTime = timeText;
                minutesLeft = 0;
            }

            parsedDepartures.push({
                lineLabel,
                direction,
                minutesLeft,
                actualTime,
                isLive
            });
        });

        const now = new Date();
        const secondsSinceMidnight = now.getHours() * 3600 + now.getMinutes() * 60 + now.getSeconds();
        const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Europe/Warsaw' }).format(now);

        const finalDepartures = await Promise.all(parsedDepartures.map(async (dep) => {
            if (!dep.isLive) {
                try {
                    const samplesList = await deviationOperationsModel.getAvgDeviationByLineStopTime(
                        dep.lineLabel, stopId, secondsSinceMidnight, 1800, weekday
                    );
                    
                    if (samplesList && samplesList.length > 0) {
                        const logSum = samplesList.reduce((sum, row) => sum + Math.log(row.deviation + 1), 0);
                        const logAverage = logSum / samplesList.length;
                        const predictedDeviation = Math.round(Math.exp(logAverage) - 1);
                        
                        dep.minutesLeft = Math.max(0, dep.minutesLeft + predictedDeviation);
                    }
                } catch (dbErr) {
                    console.error("[GZMTEC DB Error] Nie udało się nałożyć poprawki:", dbErr.message);
                }
            }
            return dep;
        }));

        finalDepartures.sort((a, b) => a.minutesLeft - b.minutesLeft);

        res.status(200).json(finalDepartures);

    } catch (error) {
        console.error("Błąd parsowania HTML tablicy SDIP GZM:", error.message);
        res.status(500).json({ message: "Błąd przetwarzania danych tablicy odjazdów" });
    }
});

module.exports = router;