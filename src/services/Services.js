require('dotenv').config(); // Cargar las variables de entorno
const nodemailer = require("nodemailer");
const bcrypt = require('bcrypt');

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

// MULTER SET UP
const multer = require('multer')
const path = require('path')
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, '../images')
    },
    // Specify name date + otiginalname
    filename: (req, file , cb) => {
        console.log(file);
        cb(null, Date.now() + path.extname(file.originalname))
    }
})
const upload = multer({storage: storage})

module.exports = {
    transporter,
    hashPassword,
    upload
}