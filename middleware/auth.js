const jwt = require('jsonwebtoken');
const { jwtSecret } = require('../config/auth');

function authenticateToken(req, res, next) {
  // Обычно токен передают в заголовке Authorization в формате "Bearer <token>"
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];
  if (!token) {
    return res.status(401).json({ error: "Токен не предоставлен" });
  }
  
  jwt.verify(token, jwtSecret, (err, user) => {
    if (err) {
      return res.status(403).json({ error: "Неверный токен" });
    }
    console.log("Декодированный пользователь из токена:", user);
    req.user = user;
    next();
  });
  
}

module.exports = authenticateToken;
