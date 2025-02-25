// controllers/clinics.js
const { getDB } = require('../config/db');

/**
 * Получение списка клиник, опционально по городу.
 */
async function getClinicsByCity(req, res) {
  const city = req.query.city;
  const db = getDB();
  let filter = {};
  if (city) {
    filter = { city };
  }
  
  try {
    const clinics = await db.collection('clinics').find(filter).toArray();
    res.json(clinics);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getClinicsByCity
};
