const deviationLoggerModel = require("../models/deviationLogger.model");

const WEEKDAY_TIME_ZONE = process.env.WEEKDAY_TIME_ZONE || 'Europe/Warsaw';

const getWeekdayAndSecondsOfDay = (timestamp) => {
    // Tworzymy obiekt daty z timestampu (sekundy)
    const date = new Date(timestamp * 1000);
    
    // Pobieramy poszczególne elementy czasu wymuszając strefę Europe/Warsaw
    const formatter = new Intl.DateTimeFormat('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
        timeZone: WEEKDAY_TIME_ZONE,
    });
    
    // Obliczamy dzień tygodnia w strefie lokalnej serwera (0 = niedziela, 1 = poniedziałek... 6 = sobota)
    const localDateStr = date.toLocaleString('en-US', { timeZone: WEEKDAY_TIME_ZONE });
    const localDate = new Date(localDateStr);
    
    // Konwertujemy standard JS (0-6, gdzie 0 to niedziela) na standard MySQL (0-6, gdzie 0 to poniedziałek)
    let mysqlWeekday = localDate.getDay() - 1;
    if (mysqlWeekday === -1) {
        mysqlWeekday = 6; // Niedziela w JS to 0, w MySQL to 6
    }

    const parts = formatter.formatToParts(date);
    const hour = Number(parts.find((part) => part.type === 'hour')?.value || 0);
    const minute = Number(parts.find((part) => part.type === 'minute')?.value || 0);
    const second = Number(parts.find((part) => part.type === 'second')?.value || 0);

    return {
        weekdayIndex: mysqlWeekday,
        secondsOfDay: (hour * 3600) + (minute * 60) + second,
    };
};

const calculateMedian = (values) => {
    if (values.length === 0) {
        return null;
    }

    const sorted = [...values].sort((left, right) => left - right);
    const middle = Math.floor(sorted.length / 2);

    if (sorted.length % 2 === 1) {
        return sorted[middle];
    }

    return (sorted[middle - 1] + sorted[middle]) / 2;
};

const deviationLoggerController = {
    logDeviation: async (req, res) => {
        const { trip, lineLabel, stop_id, vehicle_id, deviation } = req.body;
        try {
            const result = await deviationLoggerModel.logDeviation(trip, lineLabel, stop_id, vehicle_id, deviation);
            res.status(200).json({ message: "Deviation logged successfully", id: result });
        } catch (error) {
            console.error("Error logging deviation:", error);
            res.status(500).json({ message: "Error logging deviation" });
        }
    },

    estimateDeviation: async (req, res) => {
        const { lineLabel, stopId, timestamp } = req.query; 
        if (!lineLabel || !stopId || !timestamp) {
            return res.status(400).json({ message: "lineLabel, stopId, and timestamp are required" });
        }

        let targetTimestamp = parseInt(timestamp, 10);
        if (Number.isNaN(targetTimestamp)) {
            return res.status(400).json({ message: "Invalid timestamp" });
        }

        // Jeśli podano milisekundy (13 cyfr), ucinamy do sekund (10 cyfr)
        if (targetTimestamp > 9999999999) {
            targetTimestamp = Math.floor(targetTimestamp / 1000);
        }

        const windowSeconds = 5 * 60; // Okno 5 minut
        const { weekdayIndex, secondsOfDay } = getWeekdayAndSecondsOfDay(targetTimestamp);

        try {
            const rows = await deviationLoggerModel.getDeviationSamplesByLineStopWeekdayTime(
                lineLabel, 
                stopId, 
                weekdayIndex,
                secondsOfDay,
                windowSeconds
            );

            // Zabezpieczenie przed strukturą tablicy
            const safeRows = Array.isArray(rows) ? rows : [];

            const values = safeRows
                .map((row) => row && row.deviation !== undefined ? Number(row.deviation) : null)
                .filter((value) => value !== null && Number.isFinite(value));

            const averageDeviation = values.length > 0
                ? Math.round(values.reduce((sum, value) => sum + value, 0) / values.length)
                : null;
                
            const medianDeviation = calculateMedian(values);
            const weekdaysNames = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"];

            res.status(200).json({ 
                lineLabel, 
                stopId, 
                timestamp: targetTimestamp, 
                weekday: weekdaysNames[weekdayIndex],
                secondsOfDay,
                averageDeviation, 
                medianDeviation,
                samples: values.length 
            });
        } catch (error) {
            console.error("Błąd:", error);
            res.status(500).json({ message: "Error estimating deviation", details: error.message });
        }
    }
};

module.exports = deviationLoggerController;