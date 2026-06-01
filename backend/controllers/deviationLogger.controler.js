const deviationLoggerModel = require("../models/deviationLogger.model");

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
        const { lineLabel, stopId, datetime } = req.query;
        if (!lineLabel || !stopId || !datetime) {
            return res.status(400).json({ message: "lineLabel, stopId, and datetime are required" });
        }

        const requested = new Date(datetime);
        if (Number.isNaN(requested.getTime())) {
            return res.status(400).json({ message: "Invalid datetime" });
        }

        const secondsOfDay = (requested.getHours() * 3600) + (requested.getMinutes() * 60) + requested.getSeconds();
        const windowSeconds = 2 * 60;

        try {
            const rows = await deviationLoggerModel.getAverageDeviationByLineStopTime(lineLabel, stopId, secondsOfDay, windowSeconds);
            const row = Array.isArray(rows) ? rows[0] : null;
            const averageDeviation = row?.average_deviation === null || row?.average_deviation === undefined ? null : Math.round(row.average_deviation);
            res.status(200).json({ lineLabel, stopId, datetime, averageDeviation, samples: row?.samples || 0 });
        } catch (error) {
            console.error("Error estimating deviation:", error);
            res.status(500).json({ message: "Error estimating deviation" });
        }
    }
}

module.exports = deviationLoggerController;