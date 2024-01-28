const Joi = require('joi');
import { Resend } from 'resend';
require('dotenv').config(); // Cargar las variables de entorno

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
        const resend = new Resend('re_2vVeNG9g_JmXv3Y1iQqCWKtwyTZUk6MSz');
        resend.emails.send({
            from: 'onboarding@resend.dev',
            to: req.body.email,
            subject: 'Email Verification',
            html: '<p>Congrats on sending your <strong>first email</strong>!</p>'
          });
    } catch (error) {
        res.status(500).json({ 'Unexpected Error:': error });
    }
}

module.exports = {
    verifyUserData,
    verificationEmail
};