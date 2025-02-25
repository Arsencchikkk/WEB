// routes/index.js
const express = require('express');
const router = express.Router();

// Другие роутеры...
const usersRouter = require('./users');
const medicinesRouter = require('./medicines');
const favoritesRouter = require('./favorites');
const clinicsRouter = require('./clinics');
const reviewsRouter = require('./reviews');
const adminRouter = require('./admin');
const authRouter = require('./auth'); // <-- Подключаем auth.js

router.use('/users', usersRouter);
router.use('/medicines', medicinesRouter);
router.use('/favorites', favoritesRouter);
router.use('/clinics', clinicsRouter);
router.use('/reviews', reviewsRouter);
router.use('/admin', adminRouter);

// Роуты для OTP
router.use('/auth', authRouter);

module.exports = router;
