const db = require('../config/db');

const userModel = {
    createUser: async function(username, email, passwordHash) {
        const [result] = await db.execute(
            'INSERT INTO users (username, email, password_hash) VALUES (?, ?, ?)',
            [username, email, passwordHash]
        );
        return result.insertId;
    },
    findByEmail: async function(email) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE email = ?',
            [email]
        );
        return rows[0];
    },
    findById: async function(id) {
        const [rows] = await db.execute(
            'SELECT * FROM users WHERE id = ?',
            [id]
        );
        return rows[0];
    },
    findFavoriteRoutes: async function(userId) {
        const [rows] = await db.execute(
            'SELECT * FROM favorite_routes WHERE user_id = ?',
            [userId]
        );
        return rows;
    },
    addFavoriteRoute: async (userId, routeData) => {
        const sql = `INSERT INTO favorite_routes 
        (user_id, route_name, from_stop_name, from_lat, from_lon, to_stop_name, to_lat, to_lon) 
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)`;
        
        const [result] = await db.query(sql, [
            userId, routeData.routeName, routeData.fromStopName, 
            routeData.fromLat, routeData.fromLon, routeData.toStopName, 
            routeData.toLat, routeData.toLon
        ]);
        return result.insertId;
    },
    deleteFavoriteRoute: async (id, userId) => {
        const sql = `DELETE FROM favorite_routes WHERE id = ? AND user_id = ?`;
        await db.query(sql, [id, userId]);
    }
}

module.exports = userModel;