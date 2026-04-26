// test-smtp.js

import { configDotenv } from "dotenv";
configDotenv();

import nodemailer from "nodemailer"
import dns from "dns";
dns.setDefaultResultOrder('ipv4first');

const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 587,
    secure: false,
    auth: {
        user: 'argonmessager193@gmail.com',
        pass: process.env.EMAIL_PASS
    },
    // Добавляем настройки для принудительного IPv4
    socketTimeout: 30000,
    connectionTimeout: 30000,
    // Явно указываем семейство протоколов
    family: 4  // 4 = IPv4, 6 = IPv6
});

transporter.verify((error, success) => {
    if (error) {
        console.error('❌ Error:', error);
    } else {
        console.log('✅ SMTP works!');
    }
});

// Или отправьте тестовое письмо
transporter.sendMail({
    from: 'argonmessager193@gmail.com',
    to: 'gulaevkirill899@gmail.com',
    subject: 'Test SMTP',
    text: 'If you see this, SMTP works!'
}).then(() => console.log('Email sent!'))
  .catch(err => console.error('Send error:', err));