const express = require("express")
const router = express.Router()
const userController = require('../../controllers/user.controller');
const authMiddleware = require('../../middleware/auth.middleware');

router.post('/favorites', authMiddleware, userController.addFavorite);
router.get('/favorites', authMiddleware, userController.getFavorites);

module.exports = router;