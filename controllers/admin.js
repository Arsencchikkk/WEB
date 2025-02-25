// controllers/admin.js
const Medicine = require('../models/Medicine'); // Если используете Mongoose
const User = require('../models/User');
const Clinic = require('../models/Clinic');
const { getDB } = require('../config/db');
const mongoose = require('mongoose');




async function addMedicine(req, res) {
  try {
    const input = req.body;
    const medicine = new Medicine(input); // Если Mongoose
    const savedMedicine = await medicine.save();
    return res.status(200).json({ message: "Лекарство добавлено", medicine_id: savedMedicine._id });
  } catch (err) {
    return res.status(500).json({ error: "Ошибка добавления лекарства: " + err.message });
  }
}

async function deleteMedicine(req, res) {
  const adminID = req.query.admin_id;
  if (adminID !== AdminID) {
    return res.status(403).json({ error: "Доступ запрещён" });
  }
  
  const id = req.params.id;
  try {
    const result = await Medicine.deleteOne({ _id: id });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Лекарство не найдено" });
    }
    return res.status(200).json({ message: "Лекарство удалено" });
  } catch (err) {
    return res.status(500).json({ error: "Ошибка при удалении лекарства: " + err.message });
  }
}

async function deleteUserAdmin(req, res) {
  // Проверка admin_id из query (если требуется)
  const adminId = req.query.admin_id ? req.query.admin_id.trim() : "";
  const expectedAdminId = "67b75f97a63dcb09618e8b92";
  if (adminId !== expectedAdminId) {
    return res.status(403).json({ error: "Доступ запрещён" });
  }

  // Извлекаем user_id из тела запроса
  const rawUserId = req.body.user_id ? req.body.user_id.trim() : "";
  if (!rawUserId) {
    return res.status(400).json({ error: "user_id обязателен" });
  }
  if (!/^[0-9a-fA-F]{24}$/.test(rawUserId)) {
    return res.status(400).json({ error: "Некорректный формат user_id" });
  }

  let userIdObj;
  try {
    userIdObj = new mongoose.Types.ObjectId(rawUserId);
  } catch (err) {
    return res.status(400).json({ error: "Ошибка преобразования user_id" });
  }

  try {
    const result = await User.deleteOne({ _id: userIdObj });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    return res.status(200).json({ message: "Пользователь удалён" });
  } catch (err) {
    return res.status(500).json({ error: "Ошибка при удалении пользователя: " + err.message });
  }
}

async function addClinic(req, res) {
  try {
    const input = req.body;
    const clinic = new Clinic(input);
    const savedClinic = await clinic.save();
    return res.status(200).json({ message: "Клиника добавлена", clinic_id: savedClinic._id });
  } catch (err) {
    return res.status(500).json({ error: "Ошибка добавления клиники: " + err.message });
  }
}

function adminDashboard(req, res) {
  return res.status(200).json({ message: "Добро пожаловать в админку!" });
}

module.exports = {
  addMedicine,
  deleteMedicine,
  deleteUserAdmin,
  addClinic,
  adminDashboard
};
