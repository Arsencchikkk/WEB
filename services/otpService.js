const nodemailer = require('nodemailer');
const otpGenerator = require('otp-generator');


const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465, // или 587
    secure: true, // true для 465, false для 587
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS
    }
  });
  

// Функция генерации OTP (6-значный числовой код)
function generateOTP() {
  return otpGenerator.generate(6, { upperCaseAlphabets: false, specialChars: false, lowerCaseAlphabets: false });
}


async function sendOTP(email, otp) {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to: email,
    subject: 'Салам Алейкум, Ваш OTP код',
    text: `Ваш одноразовый код для верификации: ${otp}. Код действителен в течение 5 минут. и не спамте `
  };

  return transporter.sendMail(mailOptions);
}

module.exports = { generateOTP, sendOTP };
