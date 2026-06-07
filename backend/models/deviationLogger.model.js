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
    }
}

module.exports = deviationLoggerModel;