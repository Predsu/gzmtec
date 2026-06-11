const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const userModel = require('../models/user.model');

const userController = {
    register: async (req, res) => {
        const {username, email, password} = req.body;
        try {
            const existingUser = await userModel.findByEmail(email);
            if (existingUser) return res.status(400).json({message:"Email already taken"});

            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(password, salt);

            await userModel.createUser(username, email, passwordHash);
            res.status(201).json({message:"Successfully registered"});
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    },
    login: async (req, res) => {
        const {email, password} = req.body;
        try {
            const user = await userModel.findByEmail(email);
            if (!user) return res.status(400).json({message:"Incorrect email or password"});
            
            const validPass = await bcrypt.compare(password, user.password_hash);
            if (!validPass) return res.status(400).json({message:"Incorrect email or password"});

            const token = jwt.sign({ id: user.id, username: user.username }, process.env.JWT_SECRET, { expiresIn: '24h' });
            res.status(200).json({ token, username: user.username });
        } catch (err) {
            res.status(500).json({error: err.message});
        }
    },
    addFavorite: async (req, res) => {
        try {
            const { routeName, fromStopName, fromLat, fromLon, toStopName, to_lat, toLat, toLon } = req.body;
            
            if (!routeName || !fromStopName || !toStopName) {
                return res.status(400).json({ message: "Brakujące pola trasy." });
            }

            const routeData = {
                routeName,
                fromStopName,
                fromLat: fromLat || req.body.from_lat,
                fromLon: fromLon || req.body.from_lon,
                toStopName,
                toLat: toLat || req.body.to_lat,
                toLon: toLon || req.body.to_lon
            };

            const routeId = await userModel.addFavoriteRoute(req.user.id, routeData);
            res.status(201).json({ message: "Dodano do ulubionych", routeId });
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    },
    getFavorites: async (req, res) => {
        try {
            const favorites = await userModel.findFavoriteRoutes(req.user.id);
            res.status(200).json(favorites);
        } catch (err) {
            res.status(500).json({ error: err.message });
        }
    }
}

module.exports = userController;