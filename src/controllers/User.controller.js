// Iniciar el sequalize
const Sequelize = require('sequelize');
const connection = require('../database/connection');
require('dotenv').config(); // Cargar las variables de entorno
const jwt = require('jsonwebtoken')

// Importar el modelo
const User = require('../models/user')(connection, Sequelize);

// GETALL
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            // No queremos que se muestre la contraseña
            attributes: ['userName', 'email', 'isAdmin', 'isBanned', 'avatar', 'emailVerified', 'createdAt', 'updatedAt'],
        });
        res.status(200).json(users);
        // console.log(users);
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

// REGISTER
const registerUser = async (req, res) => {
    try {
        const userInput = { 
            userName: req.body.userName, 
            email: req.body.email, 
            password: req.body.password
        }

        console.log("Usuario del usuario");
        console.log(userInput);

        const user = await User.create(userInput);

        // Generar un json web token
        const token = jwt.sign(user, process.env.SECRET_KEY, {expiresIn: '24h'})
        res.status(200).json({
            user: user,
            token: token
        });
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
};

// Exportar los métodos del controlador
module.exports = {
    getAllUsers,
    registerUser
};