const deviationOperationsModel = require('../models/deviationOperations.model');

const deviationOperationsController = {
    estimateDeviation: async (req, res) => {
        const { lineLabel, stopId, timestamp, tolerance, weekday } = req.query;
        if (!lineLabel || !stopId || !timestamp || !tolerance || !weekday) {
            return res.status(400).json({ message: "lineLabel, stopId, timestamp, tolerance, weekday are required" });
        }

        try {
            const samplesList = await deviationOperationsModel.getAvgDeviationByLineStopTime(lineLabel, stopId, timestamp, tolerance, weekday);
            
            const samplesCount = samplesList.length;
            let averageDeviation = null;

            if (samplesCount > 0) {
                const logSum = samplesList.reduce((sum, row) => sum + Math.log(row.deviation + 1), 0);
                
                const logAverage = logSum / samplesCount;
                
                averageDeviation = Math.round(Math.exp(logAverage) - 1);
            }

            res.status(200).json({ 
                lineLabel, 
                stopId, 
                timestamp, 
                averageDeviation, 
                samples: samplesCount,
                samplesData: samplesList
            });

        } catch (error) {
            console.error("ERR estimating deviation:", error);
            res.status(500).json({ message: "ERR estimating deviation", error: error.message });
        }
    }
};

module.exports = deviationOperationsController;