require('dotenv').config(); // Cargar las variables de entorno
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt')

const transporter = nodemailer.createTransport({
    host: "smtp.zoho.eu",
    port: 465,
    secure: true,
    auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_PASS,
    },
});

// HASH PASSWORD FUNCTION
const hashPassword = async (password) => {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    return hashedPassword;
};

module.exports = {
    transporter,
    hashPassword,
}