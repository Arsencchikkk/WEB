// routes/admin.js
const express = require('express');
const router = express.Router();
const adminController = require('../controllers/admin');

// POST /admin/medicine
router.post('/medicine', adminController.addMedicine);

// DELETE /admin/medicine/:id
router.delete('/medicine/:id', adminController.deleteMedicine);

// DELETE /admin/user
router.delete('/user', adminController.deleteUserAdmin);

// POST /admin/clinic
router.post('/clinic', adminController.addClinic);

// GET /admin/dashboard
router.get('/dashboard', adminController.adminDashboard);

module.exports = router;
