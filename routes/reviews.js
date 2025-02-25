// routes/reviews.js
const express = require('express');
const router = express.Router();
const reviewsController = require('../controllers/reviews');

// POST /reviews
router.post('/', reviewsController.addReview);

// GET /reviews?medicine_id=...
router.get('/', reviewsController.getReviewsByMedicine);

// GET /reviews/average?medicine_id=...
router.get('/average', reviewsController.getAverageRating);

module.exports = router;
