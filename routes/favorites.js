const express = require('express');
const router = express.Router();
const favoritesController = require('../controllers/favorites');
const authenticateToken = require('../middleware/auth');

// Все маршруты защищены: user_id извлекается из токена.
router.get('/', authenticateToken, favoritesController.getFavorites);
router.post('/', authenticateToken, favoritesController.addToFavorites);
router.delete('/:id', authenticateToken, favoritesController.removeFromFavorites);

module.exports = router;
