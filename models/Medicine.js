// models/Medicine.js
const mongoose = require('mongoose');

const MedicineSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  category: { type: String, required: true },
  dosage: { type: String, required: true },
  manufacturer: { type: String, required: true },
  price: { type: Number, required: true },
  availability: { type: Boolean, required: true },
  image_url: { type: String } // Ссылка на изображение лекарства
});

module.exports = mongoose.model('Medicine', MedicineSchema);
