const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { jwtSecret, jwtExpiresIn } = require('../config/auth');

/**
 * Регистрация пользователя (Публичный эндпоинт)
 */
async function registerUser(req, res, next) {
  const { first_name, last_name, email, phone, city, password } = req.body;
  if (!first_name || !last_name || !email || !phone || !city || !password) {
    return res.status(400).json({ error: "Все поля обязательны" });
  }
  const db = getDB();
  try {
    const existing = await db.collection('users').findOne({ $or: [{ email }, { phone }] });
    if (existing) {
      return res.status(409).json({ error: "Этот email или телефон уже используется" });
    }
    const hashedPassword = await bcrypt.hash(password, 10);
    const user = { first_name, last_name, email, phone, city, password: hashedPassword };
    const result = await db.collection('users').insertOne(user);
    const user_id = result.insertedId.toString();
    // Генерация JWT-токена
    const token = jwt.sign({ user_id, email }, jwtSecret, { expiresIn: jwtExpiresIn });
    res.json({ message: "Регистрация успешна!", user_id, token });
  } catch (err) {
    next(err);
  }
}

/**
 * Логин пользователя (Публичный эндпоинт)
 */
async function loginUser(req, res, next) {
  const { login, password } = req.body;
  if (!login || !password) {
    return res.status(400).json({ error: "Введите логин и пароль" });
  }
  const db = getDB();
  try {
    const user = await db.collection('users').findOne({
      $or: [{ email: login }, { phone: login }]
    });
    if (!user) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }
    const match = await bcrypt.compare(password, user.password);
    if (!match) {
      return res.status(401).json({ error: "Неверные учетные данные" });
    }
    const user_id = user._id.toString();
    const token = jwt.sign({ user_id, email: user.email }, jwtSecret, { expiresIn: jwtExpiresIn });
    res.json({ message: "Login successful", user_id, token });
  } catch (err) {
    next(err);
  }
}

/**
 * Получение профиля пользователя (Приватный эндпоинт)
 * Токен проверяется middleware, и req.user содержит { user_id, email, ... }
 */
async function getProfile(req, res, next) {
  // Ожидается, что middleware аутентификации установил req.user с полем user_id
  const userIdStr = req.user && req.user.user_id;
  if (!userIdStr) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  
  const db = getDB();
  try {
    const user = await db.collection('users').findOne({ _id: new ObjectId(userIdStr) });
    if (!user) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.json({
      first_name: user.first_name,
      last_name: user.last_name,
      email: user.email,
      phone: user.phone,
      city: user.city
    });
  } catch (err) {
    next(err);
  }
}


/**
 * Обновление профиля пользователя (Приватный эндпоинт)
 */
async function updateProfile(req, res, next) {
  const user_id = req.user?.user_id;
  if (!user_id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { first_name, last_name, email, phone } = req.body;
  if (!first_name && !last_name && !email && !phone) {
    return res.status(400).json({ error: "Нет данных для обновления" });
  }
  const updateFields = {};
  if (first_name !== undefined) updateFields.first_name = first_name;
  if (last_name !== undefined) updateFields.last_name = last_name;
  if (email !== undefined) updateFields.email = email;
  if (phone !== undefined) updateFields.phone = phone;
  
  const db = getDB();
  try {
    const result = await db.collection('users').updateOne(
      { _id: new ObjectId(user_id) },
      { $set: updateFields }
    );
    if (result.matchedCount === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.json({ message: "Профиль обновлён!" });
  } catch (err) {
    next(err);
  }
}

/**
 * Удаление пользователя (Приватный эндпоинт)
 */
async function deleteUser(req, res, next) {
  const user_id = req.user?.user_id;
  if (!user_id) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const db = getDB();
  try {
    const result = await db.collection('users').deleteOne({ _id: new ObjectId(user_id) });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Пользователь не найден" });
    }
    res.json({ message: "Пользователь удалён" });
  } catch (err) {
    next(err);
  }
}

module.exports = {
  registerUser,
  loginUser,
  getProfile,
  updateProfile,
  deleteUser
};
