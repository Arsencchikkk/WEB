// routes/auth.js
const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth');


router.post('/request-otp', authController.requestOTP);


router.post('/verify-otp', authController.verifyOTP);

module.exports = router;
