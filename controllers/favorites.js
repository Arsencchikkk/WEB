const { getDB } = require('../config/db');
const { ObjectId } = require('mongodb');

/**
 * Получение избранных лекарств залогиненного пользователя.
 * User_id извлекается из req.user, установленного authenticateToken.
 */
async function getFavorites(req, res) {
  const userId = req.user?.user_id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }

  let userObjectId;
  try {
    userObjectId = new ObjectId(userId.trim());
  } catch (err) {
    return res.status(400).json({ error: "Invalid user_id format" });
  }

  try {
    const db = getDB();
    const pipeline = [
      { $match: { user_id: userObjectId } },
      {
        $lookup: {
          from: "medicines",
          localField: "medicine_id",
          foreignField: "_id",
          as: "medicine"
        }
      }
    ];
    const favorites = await db.collection('favorites').aggregate(pipeline).toArray();
    favorites.forEach(fav => {
      if (fav._id) fav._id = fav._id.toString();
      if (fav.medicine && fav.medicine.length > 0 && fav.medicine[0]._id) {
        fav.medicine[0]._id = fav.medicine[0]._id.toString();
      }
    });
    res.json(favorites);
  } catch (err) {
    res.status(500).json({ error: "Database error" });
  }
}

/**
 * Добавление лекарства в избранное для залогиненного пользователя.
 * user_id берется из req.user.
 */
async function addToFavorites(req, res) {
  const userId = req.user?.user_id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const { medicine_id } = req.body;
  if (!medicine_id) {
    return res.status(400).json({ error: "medicine_id обязателен" });
  }
  let userObjectId, medicineObjectId;
  try {
    userObjectId = new ObjectId(userId.trim());
    medicineObjectId = new ObjectId(medicine_id.trim());
  } catch (err) {
    return res.status(400).json({ error: "Invalid user_id or medicine_id format" });
  }
  try {
    const db = getDB();
    const existing = await db.collection('favorites').findOne({
      user_id: userObjectId,
      medicine_id: medicineObjectId
    });
    if (existing) {
      return res.status(409).json({ message: "Medicine is already in favorites" });
    }
    const favorite = { user_id: userObjectId, medicine_id: medicineObjectId };
    await db.collection('favorites').insertOne(favorite);
    res.json({ message: "Medicine added to favorites!" });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

/**
 * Удаление лекарства из избранного для залогиненного пользователя.
 * user_id берется из req.user.
 */
async function removeFromFavorites(req, res) {
  const userId = req.user?.user_id;
  if (!userId) {
    return res.status(401).json({ error: "Unauthorized" });
  }
  const id = req.params.id;
  if (!id) {
    return res.status(400).json({ error: "Favorite ID обязателен" });
  }
  let favId;
  try {
    favId = new ObjectId(id.trim());
  } catch (err) {
    return res.status(400).json({ error: "Invalid favorite ID" });
  }
  try {
    const db = getDB();
    // Дополнительно проверяем, что удаляется запись текущего пользователя
    const result = await db.collection('favorites').deleteOne({
      _id: favId,
      user_id: new ObjectId(userId)
    });
    if (result.deletedCount === 0) {
      return res.status(404).json({ error: "Favorite not found" });
    }
    res.json({ message: "Medicine removed from favorites!" });
  } catch (err) {
    res.status(500).json({ error: "Failed to remove from favorites" });
  }
}

module.exports = {
  getFavorites,
  addToFavorites,
  removeFromFavorites
};
