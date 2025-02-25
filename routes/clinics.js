// routes/clinics.js
const express = require('express');
const router = express.Router();
const clinicsController = require('../controllers/clinics');

// GET /clinics?city=...
router.get('/', clinicsController.getClinicsByCity);

module.exports = router;
