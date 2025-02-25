const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');
const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

/**
 * Админский логин.
 * Если введены email: "admin@admin" и password: "admin",
 * генерируется JWT с флагом admin: true.
 */
async function adminLogin(req, res, next) {
  const { email, password } = req.body;
  if (email === "admin@admin" && password === "admin") {
    // Генерация токена с флагом admin: true
    const token = jwt.sign({ admin: true }, jwtSecret, { expiresIn: jwtExpiresIn });
    return res.json({ message: "Admin login successful", token });
  } else {
    return res.status(401).json({ error: "Неверные учетные данные" });
  }
}

/**
 * Добавление лекарства.
 * Данные лекарства извлекаются из req.body и вставляются в коллекцию "medicines".
 */
async function addMedicine(req, res, next) {
  try {
    const db = getDB();
    const medicine = {
      name: req.body.name,
      description: req.body.description,
      category: req.body.category,
      dosage: req.body.dosage,
      manufacturer: req.body.manufacturer,
      price: req.body.price,
      availability: req.body.availability !== undefined ? req.body.availability : true,
      image_url: req.body.image_url
    };
    const result = await db.collection('medicines').insertOne(medicine);
    res.json({ message: "Лекарство добавлено", medicine_id: result.insertedId.toString() });
  } catch (err) {
    next(err);
  }
}

/**
 * Удаление лекарства по ID.
 * ID лекарства передается через req.params.id.
 */
async function deleteMedicine(req, res, next) {
  try {
    const db = getDB();
    const medId = req.params.id;
    if (!medId) {
      return res.status(400).json({ error: "Medicine ID обязателен" });
    }
    const result = await db.collection('medicines').deleteOne({ _id: new ObjectId(medId) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Лекарство не найдено" });
    }
    res.json({ message: "Лекарство удалено" });
  } catch (err) {
    next(err);
  }
}

/**
 * Удаление пользователя (административно).
 * ID пользователя передается в req.body.user_id.
 */
async function deleteUserAdmin(req, res, next) {
  try {
    const db = getDB();
    const { user_id } = req.body;
    if (!user_id) {
      return res.status(400).json({ error: "User ID обязателен" });
    }
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(user_id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.json({ message: "Пользователь удалён" });
  } catch (err) {
    next(err);
  }
}

/**
 * Добавление клиники.
 * Данные клиники извлекаются из req.body и вставляются в коллекцию "clinics".
 */
async function addClinic(req, res, next) {
  try {
    const db = getDB();
    const clinic = {
      name: req.body.name,
      city: req.body.city,
      address: req.body.address,
      description: req.body.description,
      url: req.body.url,
      image_url: req.body.image_url
    };
    const result = await db.collection('clinics').insertOne(clinic);
    res.json({ message: "Клиника добавлена", clinic_id: result.insertedId.toString() });
  } catch (err) {
    next(err);
  }
}

/**
 * Админская панель (Dashboard).
 * Возвращает базовую статистику: количество пользователей, лекарств и клиник.
 */
async function adminDashboard(req, res, next) {
  try {
    const db = getDB();
    const usersCount = await db.collection('users').countDocuments();
    const medicinesCount = await db.collection('medicines').countDocuments();
    const clinicsCount = await db.collection('clinics').countDocuments();
    res.json({
      message: "Добро пожаловать в админку!",
      stats: {
        users: usersCount,
        medicines: medicinesCount,
        clinics: clinicsCount
      }
    });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  adminLogin,
  addMedicine,
  deleteMedicine,
  deleteUserAdmin,
  addClinic,
  adminDashboard
};
