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
                MAX(id) as id, 
                MAX(deviation) as deviation, 
                MIN(departure_seconds) as departure_seconds 
            FROM deviations 
            WHERE lineLabel = ? 
            AND stop_id = ? 
            AND departure_seconds BETWEEN ? AND ?
            AND weekday = ?
            GROUP BY trip, vehicle_id
        `;
        
        const minTime = targetTime - Number(tolerance);
        const maxTime = targetTime + Number(tolerance);

        const [rows] = await db.query(sql, [lineLabel, stopId, minTime, maxTime, weekday]);
        console.log(`[DB Aggregation] ${rows.length} unique trips returned`);
        return rows; 
    }
};

module.exports = deviationOperationsModel;