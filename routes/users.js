const express = require('express');
const router = express.Router();
const usersController = require('../controllers/users');
const authenticateToken = require('../middleware/auth');

router.post('/register', usersController.registerUser);
router.post('/login', usersController.loginUser);

// Защищённые эндпоинты – пользовательские данные берутся из токена (req.user)
router.get('/profile', authenticateToken, usersController.getProfile);
router.put('/profile', authenticateToken, usersController.updateProfile);
router.delete('/profile', authenticateToken, usersController.deleteUser);

module.exports = router;
