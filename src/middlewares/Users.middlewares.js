// DEPENDENCIAS
const Joi = require('joi');
require('dotenv').config(); // Cargar las variables de entorno
const jwt = require('jsonwebtoken')
const Sequelize = require('sequelize');

// IMPORTAR EL MODELO
const connection = require('../database/connection');
const User = require('../models/user')(connection, Sequelize);

// VERIFY DATA OF USER
const verifyUserData = async (req, res, next) => {
    try {
        // Creamos el esquema
        const UserSchema = Joi.object({
            // Minimo 3 caracteres maximo 30
            userName: Joi.string()
                .alphanum()
                .min(3)
                .max(30)
                .required(),

            email: Joi.string()
                .email()
                .required(),
            /*
                - La contraseña debe contener al menos una letra mayúscula.
                - La contraseña debe contener al menos un dígito.
                - La contraseña debe contener al menos uno de los caracteres especiales: !@#\$%\^&\*.
                - La longitud total de la contraseña debe ser al menos 8 caracteres.
            */
            password: Joi.string()
                .pattern(/^(?=.*[A-Z])(?=.*[0-9])(?=.*[!@#\$%\^&\*])(?=.{8,})/)
                .required(),
        });

        // Definimos el usuario que nos pasan de la ruta
        const user = req.body;
        // Definimos el error
        const { error } = UserSchema.validate(user);
        // Si los datos son correctos pasamos a la ruta
        if (error) {
            res.status(400).json({ 'Bad request': error.details });
        } else {
            next();
        }
    } catch (error) {
        res.status(500).json({ 'Unexpected Error:': error });
    }
}

// ENVIAR UN EMAIL DE VERIFICACION
const verificationEmail = async (req, res, next) => {
    try {
        // Endpoint URL
        const endpointUrl = 'http://127.0.0.1:3000/api/user/verify/';

        // Payload
        const tokenPayload = {
            email: req.body.email
        }
        // Generar un json web token
        const token = jwt.sign(tokenPayload, process.env.SECRET_KEY, { expiresIn: '24h' })
        // Generar la ruta a la que tiene que llegar con el token
        const verificationUrl = `${endpointUrl}${token}`;

        // Enviar email
        // Import the transporter object
        const { transporter } = require('../services/Services.js');
        async function main() {
            // send mail with defined transport object
            const info = await transporter.sendMail({
                from: 'diamondbet@zohomail.eu',
                to: req.body.email,
                subject: "Verification Email",
                html: `
            <p>Clica el boton para verificar tu cuenta </p>
            <a href="${verificationUrl}" target="_blank">
                <button style="padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 5px;">
                    Verifica tu Email
                </button>
            </a>
        `,
            });

            console.log("Message sent: %s", info.messageId);
        }

        await main();
        next();
    } catch (error) {
        console.error("Error sending verification email:", error);
        res.status(500).json({ 'Unexpected Error:': error.message });
    }
}

// VERIFY THAT THE TOKEN BELONGS TO THE USER
const verifyToken = async (req, res, next) => {
    try {
        // Obtener el token
        const authorizationHeader = req.headers['authorization'];
        const paramId = req.params.id;
        // Si no ha puesto el parametro
        if (authorizationHeader === undefined) {
            res.status(400).json({ message: "Authorization header is required" });
        } else {
            // Verificar el token
            jwt.verify(authorizationHeader, process.env.SECRET_KEY, async (err, decoded) => {
                if (err) {
                    res.status(500).json({ message: "Error decodifying verify the token" })
                } else {
                    // Hacer una query para obtener el usuario
                    const userId = decoded.id
                    // Buscar el usuario
                    const userFounded = await User.findByPk(userId);
                    // console.log(userFounded);
                    // Si es admin puede pasar
                    if (userFounded.dataValues.isAdmin) {
                        next()
                    } else {
                        // Si el id es el mismo
                        if (userId == paramId) {
                            next()
                        } else {
                            return res.status(401).json({ message: "You are not the owner of this user" });
                        }
                    }
                }
            })
        }

    } catch (error) {
        res.status(500).json({ 'Unexpected Error:': error });
    }
}

// VERIFY DATA UPDATE USER
const verifyUserDataUpdate = async (req, res, next) => {
    try {
        // Creamos el esquema
        const UserSchema = Joi.object({
            // Minimo 3 caracteres maximo 30
            userName: Joi.string()
                .alphanum()
                .min(3)
                .max(30)
                .required(),

            email: Joi.string()
                .email()
                .required(),
        });

        // Definimos el usuario que nos pasan de la ruta
        const user = req.body;
        // Definimos el error
        const { error } = UserSchema.validate(user);
        // Si los datos son correctos pasamos a la ruta
        if (error) {
            res.status(400).json({ 'Bad request': error.details });
        } else {
            next();
        }
    } catch (error) {
        res.status(500).json({ 'Unexpected Error:': error });
    }
}


module.exports = {
    verifyUserData,
    verificationEmail,
    verifyToken,
    verifyUserDataUpdate
};