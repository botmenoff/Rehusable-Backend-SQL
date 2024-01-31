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

        const user = await User.create(userInput);

        res.status(200).json({
            user: {
                userName: user.userName,
                email: user.email,
                isAdmin: user.isAdmin,
                isBanned: user.isBanned,
                avatar: user.avatar,
                emailVerified: user.emailVerified,
                createdAt: user.createdAt,
                updatedAt: user.updatedAt
            }
        });
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
};

// VERIFY EMAIL
const verifyEmail = async (req,res) => {
    try {
        const token = req.params.jwt
        console.log(jwt);

        // Verificar el token
        jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
            if (err) {
                res.status(500).json({message: "Error decodifying"})
            } else {
                // Hacer una query para obtener el usuario
                const userEmail = decoded.email
                console.log();
                console.log(userEmail);
                // Buscar el usuario
                const user = await User.findOne({ where: { email: userEmail } });
                // Si no lo encuentra
                if (!user) {
                    return res.status(404).json({ message: "Usuario no encontrado" });
                } else {
                    // Hacer la consulta
                    const updatedUser = await User.update({emailVerified: true}, {where: {email: userEmail}})
                }
                res.status(200).json({ message: "Email verificado exitosamente" });
            }
        })

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
}

// DELETE BY ID
const deleteUsersById = async (req, res) => {
    try {
        const userId = req.params.id;
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }
        await user.destroy();
        res.status(200).json({ message: "Usuario eliminado exitosamente" });
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
}

// Exportar los métodos del controlador
module.exports = {
    getAllUsers,
    registerUser,
    verifyEmail,
    deleteUsersById
};