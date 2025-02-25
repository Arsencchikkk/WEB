const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');
const authenticateToken = require('../middleware/auth');

// Админский логин
router.post('/login', adminController.adminLogin);

// Другие админские маршруты (защищенные)
router.post('/medicine', authenticateToken, adminController.addMedicine);
router.delete('/medicine/:id', authenticateToken, adminController.deleteMedicine);
router.delete('/user', authenticateToken, adminController.deleteUserAdmin);
router.post('/clinic', authenticateToken, adminController.addClinic);
router.get('/dashboard', authenticateToken, adminController.adminDashboard);

module.exports = router;
