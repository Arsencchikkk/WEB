const express = require('express');
const router = express.Router();

const usersRouter = require('./users'); // убедитесь, что файл users.js существует в той же папке
// Другие роутеры, например:
const medicinesRouter = require('./medicines');
const favoritesRouter = require('./favorites');
const clinicsRouter = require('./clinics');
const reviewsRouter = require('./reviews');
const adminRouter = require('./admin');

router.use('/users', usersRouter);
router.use('/medicines', medicinesRouter);
router.use('/favorites', favoritesRouter);
router.use('/clinics', clinicsRouter);
router.use('/reviews', reviewsRouter);
router.use('/admin', adminRouter);

module.exports = router;
