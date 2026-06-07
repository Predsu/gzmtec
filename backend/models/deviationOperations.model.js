const db = require('../config/db');

const WEEKDAY_TIME_ZONE = process.env.WEEKDAY_TIME_ZONE || 'Europe/Warsaw';

const getCurrentWeekdayName = () => new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: WEEKDAY_TIME_ZONE,
}).format(new Date());

const deviationOperationsModel = {
    getAvgDeviationByLineStopTime: async (lineLabel, stopId, timestamp, tolerance, weekday) => {
        const targetTime = Number(timestamp);
        
        const sql = `
            SELECT 
                id, 
                deviation, 
                timestamp 
            FROM deviations 
            WHERE lineLabel = ? 
            AND stop_id = ? 
            AND timestamp BETWEEN ? AND ?
            AND weekday = ?
        `;
        
        const minTime = targetTime - Number(tolerance);
        const maxTime = targetTime + Number(tolerance);

        const [rows] = await db.query(sql, [lineLabel, stopId, minTime, maxTime, weekday]);
        return rows; 
    }
};

module.exports = deviationOperationsModel;