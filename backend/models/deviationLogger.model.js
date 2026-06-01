const db = require('../config/db');

const deviationLoggerModel = {
    logDeviation:  async (trip, lineLabel, stop_id, vehicle_id, deviation) => {
        const result = await db.query("INSERT INTO deviations (trip, lineLabel, stop_id, vehicle_id, deviation, arrival_time) VALUES (?, ?, ?, ?, ?, NOW())", [trip, lineLabel, stop_id, vehicle_id, deviation]);
        return result[0].insertId;
    },
    displayDeviationsAverage: async () => {
        const result = await db.query("SELECT trip, AVG(deviation) AS average_deviation FROM deviations GROUP BY trip");
        return result[0];
    },
    getAverageDeviationByLineStopTime: async (lineLabel, stopId, secondsOfDay, windowSeconds) => {
        const sql = "SELECT AVG(deviation) AS average_deviation, COUNT(*) AS samples " +
            "FROM deviations " +
            "WHERE lineLabel = ? AND stop_id = ? " +
            "AND LEAST(ABS(TIME_TO_SEC(TIME(arrival_time)) - ?), 86400 - ABS(TIME_TO_SEC(TIME(arrival_time)) - ?)) <= ?";
        const result = await db.query(sql, [lineLabel, stopId, secondsOfDay, secondsOfDay, windowSeconds]);
        return result[0];
    }
}

module.exports = deviationLoggerModel;