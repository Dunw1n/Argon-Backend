import nodemailer from 'nodemailer';
import dns from "dns"



dns.setDefaultResultOrder("ipv4first");
// Настройка почтового транспорта
const transporter = nodemailer.createTransport({
  host: process.env.EMAIL_HOST || 'smtp.gmail.com',
  port: process.env.EMAIL_PORT || 587,
  secure: false,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    ciphers: "SSLv3",
  },

  socketTimeout: 30000,
  connectionTimeout: 30000,
  family: 4
});

// Проверка подключения
transporter.verify((error, success) => {
  if (error) {
    console.error('❌ Email uration error:', error);
  } else {
    console.log('✅ Email service ready');
  }
});

class EmailService {
  async sendPinCodeEmail(email, pinCode, isRegistration = false) {
    const subject = isRegistration 
      ? 'Argon Messenger - Подтверждение регистрации'
      : 'Argon Messenger - Код для входа';
    
    const title = isRegistration
      ? 'Добро пожаловать в Argon Messenger!'
      : 'Вход в аккаунт';

    const mailOptions = {
      from: process.env.EMAIL_USER,
      to: email,
      subject,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 500px; margin: 0 auto; padding: 20px; background: #f8f9fa; border-radius: 16px;">
          <div style="text-align: center;">
            <div style="background: linear-gradient(135deg, #8b5cf6, #6421FF); padding: 20px; border-radius: 12px; margin-bottom: 20px;">
              <h1 style="color: #fff; margin: 0; font-size: 24px;">Argon Messenger</h1>
            </div>
            <h2 style="color: #333; font-size: 20px;">${title}</h2>
            <p style="font-size: 16px; color: #555;">Ваш код подтверждения:</p>
            <div style="font-size: 40px; font-weight: bold; color: #8b5cf6; letter-spacing: 10px; background: #fff; padding: 20px; border-radius: 12px; margin: 20px 0; border: 1px solid #e0e0e0;">
              ${pinCode}
            </div>
            <p style="color: #666; font-size: 14px;">Код действителен в течение 10 минут.</p>
            <p style="color: #999; font-size: 12px; margin-top: 20px;">Если вы не запрашивали код, просто проигнорируйте это письмо.</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 20px 0;" />
            <p style="color: #aaa; font-size: 11px;">Argon Messenger — безопасный мессенджер</p>
          </div>
        </div>
      `,
    };
    
    await transporter.sendMail(mailOptions);
  }
}

export default new EmailService();
