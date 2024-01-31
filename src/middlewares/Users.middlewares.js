const Joi = require('joi');
const { Resend } = require('resend')
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
        // Assuming you have the endpoint URL stored in a variable, replace 'YOUR_ENDPOINT_URL' with the actual endpoint URL
        const endpointUrl = 'YOUR_ENDPOINT_URL';
        console.log("EMAIL:");
        console.log(req.body.email);
        const resend = new Resend(process.env.API_KEY);
        (async function () {
            const { data, error } = await resend.emails.send({
                from: 'onboarding@resend.dev',
                to: [req.body.email],
                subject: 'Verificacion de Email',
                html: `
                <p>Clica el boton para verificar tu cuenta </p>
                <a href="${endpointUrl}?email=${encodeURIComponent(req.body.email)}" target="_blank">
                    <button style="padding: 10px; background-color: #4CAF50; color: white; border: none; border-radius: 5px;">
                        Verifica tu Email
                    </button>
                </a>
                `,
            });

            if (error) {
                return console.error({ error });
            }

            console.log({ data });
        })();

        //res.status(200).json({ message: 'Verification email sent successfully' });
        next()
    } catch (error) {
        res.status(500).json({ 'Unexpected Error:': error });
    }
}

module.exports = {
    verifyUserData,
    verificationEmail
};