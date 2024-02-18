// Dependencias
const Sequelize = require('sequelize');
require('dotenv').config(); // Cargar las variables de entorno
const jwt = require('jsonwebtoken')
const bcrypt = require('bcrypt')

// Archivos
const connection = require('../database/connection');
const Services = require('../services/Services');

// Importar el modelo
const User = require('../models/user')(connection, Sequelize);

// GETALL
const getAllUsers = async (req, res) => {
    try {
        const users = await User.findAll({
            // No queremos que se muestre la contraseña
            attributes: ['id', 'userName', 'email', 'isAdmin', 'isBanned', 'avatar', 'emailVerified', 'createdAt', 'updatedAt'],
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
        // Hash the password
        const hashedPassword = await Services.hashPassword(req.body.password);
        const userInput = {
            userName: req.body.userName,
            email: req.body.email,
            password: hashedPassword,
            avatar: "https://ui-avatars.com/api/?name=" + req.body.userName + "&background=0D8ABC&color=fff&size=128"
        }

        // Verificar que el usuario o el email no existan
        const userNameFound = await User.findOne({
            where: {
                userName: userInput.userName,
            }
        });
        if (userNameFound) {
            res.status(400).json({ message: "This username has already been picked" });
        }

        const emailFound = await User.findOne({
            where: {
                email: userInput.email,
            }
        });
        if (emailFound) {
            res.status(400).json({ message: "This email has already been used" });
        }


        console.log("Username not Founded");
        const user = await User.create(userInput);

        res.status(201).json({
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

// LOGIN
const loginUser = async (req, res) => {
    try {
        const userInput = {
            email: req.body.email,
            password: req.body.password
        }

        // Buscamos el usuario
        const userFound = await User.findOne({
            where: {
                email: userInput.email,
            }
        });

        if (!userFound) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        } else {
            // Comparamos la contraseña
            const validPassword = await bcrypt.compare(userInput.password, userFound.password);
            if (!validPassword) {
                return res.status(401).json({ message: "Contraseña incorrecta" });
            } else {
                // Creamos el token
                const token = await jwt.sign({ id: userFound.dataValues.id }, process.env.SECRET_KEY, {
                    expiresIn: 60 * 60 * 24 // 24 Hours
                });
                res.status(200).json({ token });
            }
        }

    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
}

// VERIFY EMAIL
const verifyEmail = async (req, res) => {
    try {
        const token = req.params.jwt
        console.log(jwt);

        // Verificar el token
        jwt.verify(token, process.env.SECRET_KEY, async (err, decoded) => {
            if (err) {
                res.status(500).json({ message: "Error decodifying" })
            } else {
                // Hacer una query para obtener el usuario
                const userEmail = decoded.email
                console.log(userEmail);
                // Buscar el usuario
                const user = await User.findOne({ where: { email: userEmail } });
                // Si no lo encuentra
                if (!user) {
                    return res.status(404).json({ message: "Usuario no encontrado" });
                } else {
                    // Hacer la consulta
                    const updatedUser = await User.update({ emailVerified: true }, { where: { email: userEmail } })
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

// UPDATE USER
const updateUser = async (req, res) => {
    try {
        const userId = req.params.id;

        // Buscar el usuario
        const user = await User.findByPk(userId);
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        // Preparar el userInput
        const userInput = {};

        // Si el campo de userName está relleno, le añadimos el campo correspondiente y generamos el avatar
        if (req.body.userName) {
            userInput.userName = req.body.userName;
            userInput.avatar = "https://ui-avatars.com/api/?name=" + req.body.userName + "&background=0D8ABC&color=fff&size=128";
        }

        // Si el campo de email está relleno, le añadimos el campo correspondiente
        if (req.body.email) {
            userInput.email = req.body.email;
        }

        // Comprobamos que haya campos para hacer el update
        if (Object.keys(userInput).length > 0) {
            let updatedUser;
            try {
                updatedUser = await user.update(userInput);
                return res.status(200).json({ message: "User updated successfully", user: updatedUser }); 
            } catch (error) {
                return res.status(500).json({ message: "Error updating user", error: error.message });
            }
        } else {
            return res.status(400).json({ message: "No fields provided for update" });
        }
    } catch (error) {
        if (!res.headersSent) {
            res.status(500).json({ message: error.message });
        }
    }
}

// BAN USERS
const banUser = async (req, res) => {
    try {
        const userId = req.params.id;
        const userFounded = await User.findByPk(userId);
        // Si el usuario se encuentra
        if (userFounded) {
            userFounded.isBanned = true;
            // Actualizar el usuario
            await userFounded.save();
            res.status(200).json({ message: "User banned successfully" });
        } else {
            res.status(404).json({ message: "User not found" });
        }
        if (!user) {
            return res.status(404).json({ message: "User not found" });
        } else {
            res.status(200).json({ user: user });
        }
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
    loginUser,
    verifyEmail,
    deleteUsersById,
    updateUser,
    banUser
};