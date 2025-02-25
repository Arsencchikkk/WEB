// config/db.js
const mongoose = require('mongoose');
require('dotenv').config();

const uri = process.env.MONGO_URI;
if (!uri) {
  console.error("MONGO_URI не задан");
  process.exit(1);
}

mongoose.connect(uri, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log("Подключение к MongoDB успешно!"))
  .catch(err => {
    console.error("Ошибка подключения к MongoDB:", err);
    process.exit(1);
  });
