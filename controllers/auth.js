const { generateOTP, sendOTP } = require('../services/otpService');


let otpStore = {};

async function requestOTP(req, res, next) {
  const { email } = req.body;
  if (!email) {
    return res.status(400).json({ error: "Email обязателен" });
  }

  const otp = generateOTP();

  otpStore[email] = { otp, expires: Date.now() + 5 * 60 * 1000 };

  try {
    await sendOTP(email, otp);
    res.json({ message: "OTP отправлен на указанный email" });
  } catch (err) {
    next(err);
  }
}


async function verifyOTP(req, res, next) {
  const { email, otp } = req.body;
  if (!email || !otp) {
    return res.status(400).json({ error: "Email и OTP обязательны" });
  }

  const record = otpStore[email];
  if (!record) {
    return res.status(400).json({ error: "OTP не найден, запросите новый" });
  }

  if (Date.now() > record.expires) {
    delete otpStore[email];
    return res.status(400).json({ error: "OTP истек, запросите новый" });
  }

  if (record.otp !== otp) {
    return res.status(400).json({ error: "Неверный OTP" });
  }

  // Если верификация успешна, удаляем запись и возвращаем подтверждение
  delete otpStore[email];
  res.json({ message: "OTP подтвержден" });
}

module.exports = {
    requestOTP,
    verifyOTP
  };