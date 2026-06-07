const db = require('../config/db');

const WEEKDAY_TIME_ZONE = process.env.WEEKDAY_TIME_ZONE || 'Europe/Warsaw';

const getCurrentWeekdayName = () => new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: WEEKDAY_TIME_ZONE,
}).format(new Date());

const deviationLoggerModel = {
    logDeviation:  async (trip, lineLabel, stop_id, vehicle_id, deviation) => {
        const weekday = getCurrentWeekdayName();
        const result = await db.query("INSERT INTO deviations (trip, lineLabel, stop_id, vehicle_id, deviation, weekday, arrival_time) VALUES (?, ?, ?, ?, ?, ?, NOW())", [trip, lineLabel, stop_id, vehicle_id, deviation, weekday]);
        return result[0].insertId;
    },
    getAvgDeviationByLineStopTime: async (lineLabel, stopId, timestamp, tolerance) => {
        const targetTime = Number(timestamp);

        const sql = `
            SELECT 
                AVG(deviation) AS average_deviation, 
                COUNT(*) AS samples 
            FROM deviations 
            WHERE lineLabel = ? 
            AND stop_id = ? 
            AND timestamp BETWEEN ? AND ?
        `;
        
        const minTime = targetTime - tolerance;
        const maxTime = targetTime + tolerance;

        const result = await db.query(sql, [lineLabel, stopId, minTime, maxTime]);
        return result[0];
    }
}

module.exports = deviationLoggerModel;