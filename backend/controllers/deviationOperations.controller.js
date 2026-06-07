const devationOperationsModel = require('../models/deviationOperations.model');

const deviationOperationsController = {
    estimateDeviation: async (req, res) => {
        const { lineLabel, stopId, timestamp } = req.query;
        if (!lineLabel || !stopId || !timestamp) {
            return res.status(400).json({ message: "lineLabel, stopId, and timestamp are required" });
        }

        try {
            const rows = await deviationOperationsModel.getAvgDeviationByLineStopTime(lineLabel, stopId, timestamp);
            const row = Array.isArray(rows) ? rows[0] : null;
            const averageDeviation = row?.average_deviation === null || row?.average_deviation === undefined ? null : Math.round(row.average_deviation);
            res.status(200).json({ lineLabel, stopId, timestamp, averageDeviation, samples: row?.samples || 0 });
        } catch (error) {
            console.error("Error estimating deviation:", error);
            res.status(500).json({ message: "Error estimating deviation", error: error.message });
        }
    }
};

module.exports = deviationOperationsController;