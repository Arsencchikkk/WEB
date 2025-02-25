const express = require('express');
const cors = require('cors');
const path = require('path');
require('dotenv').config();
const { connectDB, getDB } = require('./config/db');
const routes = require('./routes');

const app = express();

app.use(express.json());
app.use(cors({
  origin: 'http://localhost:8080',
  methods: ["GET", "POST", "DELETE", "PUT", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization"],
  credentials: true,
}));

// Подключаем маршруты
app.use('/', routes);

// Статические файлы и HTML
app.use('/static', express.static(path.join(__dirname, 'Front')));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'Front', 'index.html'));
});
app.get('/adminpanel', (req, res) => {
  res.sendFile(path.join(__dirname, 'Front', 'admin.html'));
});

// Глобальный обработчик ошибок
app.use((err, req, res, next) => {
  console.error("Global error handler:", err);
  res.status(500).json({ error: "Внутренняя ошибка сервера" });
});

const PORT = process.env.PORT || 8080;

async function init() {
  try {
    // Подключаемся к базе данных
    await connectDB();
    const db = getDB();

    
    // Запускаем сервер
    app.listen(PORT, () => console.log(`Server running on port ${PORT}`));
  } catch (err) {
    console.error("Ошибка инициализации:", err);
    process.exit(1);
  }
}

init();
