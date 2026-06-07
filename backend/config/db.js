const mysql = require('mysql2/promise');
const path = require('path');
const dotenv = require('dotenv');

dotenv.config({ path: path.resolve(__dirname, '..', '.env') });

const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_DBNAME,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  dateStrings: true
});
(async () => {
    try {
        // Próbujemy pobrać połączenie z puli i wykonać banalne zapytanie
        const connection = await pool.getConnection();
        console.log('✅ SUKCES: Połączenie z bazą danych przez tunel SSH zostało ustanowione!');
        
        // Opcjonalnie: sprawdźmy, co baza myśli o swojej strefie czasowej
        const [rows] = await connection.query('SELECT NOW() AS current_db_time, @@global.time_zone, @@session.time_zone');
        console.log('⏰ Czas i strefa w bazie danych:', rows[0]);
        
        connection.release(); // Zwalniamy połączenie z powrotem do puli
    } catch (error) {
        console.error('❌ BŁĄD POŁĄCZENIA Z BAZĄ DANYCH:');
        console.error(error.message);
        console.error('Sprawdź, czy Twój tunel SSH na porcie', process.env.DB_PORT, 'jest na pewno otwarty.');
    }
})();

module.exports = pool;
