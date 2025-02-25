const { getDB } = require('../config/db');

/**
 * Получить все лекарства
 */
async function getMedicines(req, res) {
  try {
    const db = getDB();
    const medicines = await db.collection('medicines').find({}).toArray();
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Поиск лекарства по имени или производителю
 */
async function searchMedicine(req, res) {
  const query = req.query.q;
  if (!query) {
    return res.status(400).json({ error: "Search query is required" });
  }
  try {
    const db = getDB();
    const filter = {
      $or: [
        { name: { $regex: query, $options: "i" } },
        { manufacturer: { $regex: query, $options: "i" } }
      ]
    };
    const medicines = await db.collection('medicines').find(filter).toArray();
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Получить лекарства по категории
 */
async function getMedicinesByCategory(req, res) {
  const category = req.query.category;
  if (!category) {
    return res.status(400).json({ error: "Category parameter is required" });
  }
  try {
    const db = getDB();
    const medicines = await db.collection('medicines').find({ category }).toArray();
    res.json(medicines);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

module.exports = {
  getMedicines,
  searchMedicine,
  getMedicinesByCategory
};
