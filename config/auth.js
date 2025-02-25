module.exports = {
    jwtSecret: process.env.JWT_SECRET || 'your-secret-key', // храните секрет в .env
    jwtExpiresIn: '1h' 
  };
  