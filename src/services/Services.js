require('dotenv').config(); // Cargar las variables de entorno
const nodemailer = require("nodemailer");

const transporter = nodemailer.createTransport({
    host: "smtp.zoho.eu",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

module.exports = {
    transporter,
}