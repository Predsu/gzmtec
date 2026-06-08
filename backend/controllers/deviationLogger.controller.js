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
    }
}

module.exports = deviationLoggerController;