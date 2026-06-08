const db = require('../config/db');

const WEEKDAY_TIME_ZONE = process.env.WEEKDAY_TIME_ZONE || 'Europe/Warsaw';

const getCurrentWeekdayName = () => new Intl.DateTimeFormat('en-US', {
    weekday: 'long',
    timeZone: WEEKDAY_TIME_ZONE,
}).format(new Date());

const deviationOperationsModel = {
    getAvgDeviationByLineStopTime: async (lineLabel, stopId, secondsSinceMidnight, tolerance, weekday) => {
        const targetTime = Number(secondsSinceMidnight);
        
        const sql = `
            SELECT 
                id, 
                deviation, 
                departure_seconds 
            FROM deviations 
            WHERE lineLabel = ? 
            AND stop_id = ? 
            AND departure_seconds BETWEEN ? AND ?
            AND weekday = ?
        `;
        
        const minTime = targetTime - Number(tolerance);
        const maxTime = targetTime + Number(tolerance);

        const [rows] = await db.query(sql, [lineLabel, stopId, minTime, maxTime, weekday]);
        console.log(rows);
        return rows; 
    }
};

module.exports = deviationOperationsModel;