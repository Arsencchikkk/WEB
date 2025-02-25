const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

/**
 * Добавить отзыв
 */
async function addReview(req, res) {
  const { medicine_id, user_id, rating, comment } = req.body;
  if (!medicine_id || !user_id || rating === undefined) {
    return res.status(400).json({ error: "Invalid input" });
  }
  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: "Рейтинг должен быть от 1 до 5" });
  }
  
  let medicineObjectId, userObjectId;
  try {
    medicineObjectId = new ObjectId(medicine_id.trim());
    userObjectId = new ObjectId(user_id.trim());
  } catch (err) {
    return res.status(400).json({ error: "Некорректный MedicineID или UserID" });
  }
  
  try {
    const db = getDB();
    const existingReview = await db.collection('reviews').findOne({
      medicine_id: medicineObjectId,
      user_id: userObjectId
    });
    if (existingReview) {
      return res.status(409).json({ error: "Ты уже оставил отзыв для этого лекарства" });
    }
    
    const review = {
      medicine_id: medicineObjectId,
      user_id: userObjectId,
      rating,
      comment,
      createdAt: new Date()
    };
    const result = await db.collection('reviews').insertOne(review);
    res.json({ message: "Отзыв успешно добавлен", review_id: result.insertedId.toString() });
  } catch (err) {
    res.status(500).json({ error: "Ошибка при добавлении отзыва: " + err.message });
  }
}

/**
 * Получить отзывы для конкретного лекарства
 */
async function getReviewsByMedicine(req, res) {
  const medicine_id = req.query.medicine_id;
  if (!medicine_id) {
    return res.status(400).json({ error: "medicine_id обязателен" });
  }
  let medicineObjectId;
  try {
    medicineObjectId = new ObjectId(medicine_id.trim());
  } catch (err) {
    return res.status(400).json({ error: "Некорректный формат medicine_id" });
  }
  try {
    const db = getDB();
    const reviews = await db.collection('reviews').find({ medicine_id: medicineObjectId }).toArray();
    res.json(reviews);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Получить средний рейтинг и количество отзывов
 */
async function getAverageRating(req, res) {
  // Извлекаем и очищаем параметр medicine_id
  const medicineIdStr = req.query.medicine_id ? req.query.medicine_id.trim() : "";
  if (!medicineIdStr) {
    return res.status(400).json({ error: "medicine_id обязателен" });
  }
  
  // Проверяем формат medicine_id (24 шестнадцатеричных символа)
  if (!/^[0-9a-fA-F]{24}$/.test(medicineIdStr)) {
    return res.status(400).json({ error: "Некорректный формат medicine_id" });
  }
  
  let medicineObjectId;
  try {
    medicineObjectId = new ObjectId(medicineIdStr);
  } catch (err) {
    console.error("Ошибка преобразования medicine_id:", err);
    return res.status(400).json({ error: "Некорректный формат medicine_id" });
  }
  
  try {
    const db = getDB();
    const pipeline = [
      { $match: { medicine_id: medicineObjectId } },
      {
        $group: {
          _id: "$medicine_id",
          averageRating: { $avg: "$rating" },
          count: { $sum: 1 }
        }
      }
    ];
    
    const results = await db.collection('reviews').aggregate(pipeline).toArray();
    if (results.length === 0) {
      return res.json({ averageRating: null, count: 0 });
    }
    return res.json(results[0]);
  } catch (err) {
    console.error("Ошибка агрегации:", err);
    return res.status(500).json({ error: "Ошибка агрегации: " + err.message });
  }
}

module.exports = {
  addReview,
  getReviewsByMedicine,
  getAverageRating
};
