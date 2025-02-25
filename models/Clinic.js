// models/Clinic.js
const mongoose = require('mongoose');

const ClinicSchema = new mongoose.Schema({
  name: { type: String, required: true },
  city: { type: String, required: true },
  address: { type: String, required: true },
  description: { type: String, required: true },
  url: { type: String },         // URL может быть необязательным
  image_url: { type: String }      // Ссылка на изображение
});

module.exports = mongoose.model('Clinic', ClinicSchema);
