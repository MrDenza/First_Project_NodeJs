const nodemailer = require('nodemailer');
const { EMAIL, LINK } = require("../config/email.config");
const logger = require("../utils/logger");

let transporter;

const initEmailService = () => {
    transporter = nodemailer.createTransport(EMAIL);

    // Проверка подключения
    return transporter.verify()
    .then(() => {
        logger.info(`EMAIL_SERVICE | Почтовый сервис инициализирован`);
        return true;
    })
    .catch(error => {
        logger.error(error, `EMAIL_SERVICE | Ошибка инициализации`);
        throw error;
    });
};

const sendEmail = async ({ to, subject, text, html, attachments = [] }) => {
    if (!transporter) {
        logger.error(`EMAIL_SERVICE | Почтовый сервис не инициализирован`);
        throw new Error('Почтовый сервис не инициализирован');
    }

    const mailOptions = {
        from: `"${process.env.EMAIL_SENDER_NAME || 'Система'}" <${process.env.EMAIL_USER}>`,
        to,
        subject,
        text,
        html: html || text, // Если html нет, используем text
        attachments
    };

    try {
        const info = await transporter.sendMail(mailOptions);
        console.log(`[EMAIL-SENT] Письмо отправлено -> ${to}`);
        return true;
    } catch (error) {
        logger.error(error, `EMAIL_SERVICE | Ошибка отправки письма на ${to}`);
        throw error;
    }
};

const sendActivationLink = async ({email, username, token}) => {
    const activationLink = `${LINK}?token=${token}`;
    const templateActivationMsg = `
        <p>Для успешной активации аккаунта перейдите по ссылке: <a href="${activationLink}">Активировать аккаунт</a></p>
        <p>Или скопируйте ссылку в браузер: ${activationLink}</p>
    `

    console.log(`Отправлено письмо ${username} на ${email}`);
    console.log("Ссылка: ", activationLink);

    await sendEmail({
        to: email,
        subject: 'Активация аккаунта',
        text: `Для успешной активации аккаунта перейдите по ссылке: ${activationLink}`,
        html: templateActivationMsg || text,
    });
}

module.exports = {
    initEmailService,
    sendEmail,
    sendActivationLink
};

/*
const { sendEmail } = require('../services/email.service');

// Простая отправка
await sendEmail({
  to: 'user@example.com',
  subject: 'Добро пожаловать',
  text: 'Вы успешно зарегистрировались!',
  html: '<h1>Вы успешно зарегистрировались!</h1>'
});

// С вложением
await sendEmail({
  to: 'user@example.com',
  subject: 'Ваш документ',
  text: 'Во вложении ваш документ',
  attachments: [{
    filename: 'document.pdf',
    path: '/path/to/document.pdf'
  }]
});
 */