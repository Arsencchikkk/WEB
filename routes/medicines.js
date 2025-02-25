// routes/medicines.js
const express = require('express');
const router = express.Router();
const medicinesController = require('../controllers/medicines');

// GET /medicines
router.get('/', medicinesController.getMedicines);

// GET /medicines/search?q=...
router.get('/search', medicinesController.searchMedicine);

// GET /medicines/category?category=...
router.get('/category', medicinesController.getMedicinesByCategory);

module.exports = router;
