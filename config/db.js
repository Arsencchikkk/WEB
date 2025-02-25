// config/db.js
const { MongoClient } = require('mongodb');
require('dotenv').config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI не задан");
  process.exit(1);
}

const client = new MongoClient(uri, { useUnifiedTopology: true });
let db;

async function connectDB() {
  try {
    await client.connect();
    db = client.db("local"); // Название вашей базы
    console.log("Подключение к MongoDB успешно!");
  } catch (err) {
    console.error("Ошибка подключения к MongoDB:", err);
    process.exit(1);
  }
}

function getDB() {
  if (!db) {
    throw new Error("База данных не инициализирована");
  }
  return db;
}

module.exports = { connectDB, getDB };
