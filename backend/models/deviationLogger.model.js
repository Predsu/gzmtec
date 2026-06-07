const db = require('../config/db');

const deviationLoggerModel = {
    logDeviation: async (trip, lineLabel, stop_id, vehicle_id, deviation) => {
        const weekday = new Intl.DateTimeFormat('en-US', { weekday: 'long', timeZone: 'Europe/Warsaw' }).format(new Date());
        const result = await db.query(
            "INSERT INTO deviations (trip, lineLabel, stop_id, vehicle_id, deviation, weekday, arrival_time) VALUES (?, ?, ?, ?, ?, ?, NOW())", 
            [trip, lineLabel, stop_id, vehicle_id, deviation, weekday]
        );
        return result[0].insertId;
    },
    
    getAllDeviationsByLineStop: async (lineLabel, stopId) => {
        const sql = "SELECT id, trip, lineLabel, stop_id, vehicle_id, deviation, arrival_time, weekday " +
                    "FROM deviations " +
                    "WHERE lineLabel = ? AND stop_id = ? " +
                    "ORDER BY arrival_time DESC";
                    
        const result = await db.query(sql, [lineLabel, stopId]);
        return result[0]; // Zwraca tablicę bezpośrednio bez rozbijania [rows]
    },
    
    getDeviationSamplesByLineStopWeekdayTime: async (lineLabel, stopId, weekdayIndex, targetSecondsOfDay, windowSeconds) => {
        const sql = "SELECT deviation " +
            "FROM deviations " +
            "WHERE lineLabel = ? AND stop_id = ? AND WEEKDAY(arrival_time) = ? " +
            "AND ABS(TIME_TO_SEC(CAST(arrival_time AS TIME)) - ?) <= ?";

        const result = await db.query(sql, [lineLabel, stopId, weekdayIndex, targetSecondsOfDay, windowSeconds]);
        return result[0]; // Zwraca tablicę bezpośrednio
    }
};

module.exports = deviationLoggerModel;