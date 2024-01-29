// Iniciar el sequalize
const Sequelize = require('sequelize');
const sequelize = require('../database/connection');

// Importar el modelo
const User = require('../models/user')(sequelize, Sequelize);

// GETALL
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            // No queremos que se muestre la contraseña
            attributes: ['userName', 'email', 'isAdmin', 'isBanned', 'avatar', 'createdAt', 'updatedAt'],
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
        // const { userName, email, password } = req.body;
        // const user = await User.create({ userName, email, password });
        res.status(200).json("LLEGADO AQUI CREANDO USER...");
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