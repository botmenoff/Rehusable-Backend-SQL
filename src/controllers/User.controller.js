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
const updateUser = async (req,res) => {
    try {
        const userId = req.params.id;
        console.log(userId);
        // Buscar el usuario
        const user = await User.findByPk(userId)
        if (!user) {
            return res.status(404).json({ message: "Usuario no encontrado" });
        }

        const userInput = {
            userName: req.body.userName,
            email: req.body.email,
            avatar: "https://ui-avatars.com/api/?name=" + req.body.userName + "&background=0D8ABC&color=fff&size=128"
        }

        // // Verificar si el userName o el email existen
        // const repeatedUsername = await User.findOne({where: {userName: req.body.userName}})
        // console.log("USERNAME");
        // console.log(req.body.userName);
        // // console.log(repeatedUsername);
        // if(!repeatedUsername){
        //     // No hacer nada
        // } else if (repeatedUsername.dataValues.userName == req.body.userName) {
        //     return res.status(404).json({ message: "User with that Username already exists" });
        // }
        // console.log("Username not found");
        // const repeatedEmail = await User.findOne({where: {email: req.body.email}})
        // if (!repeatedEmail) {
        //     // No hacer nada
        // } else if(repeatedEmail.dataValues.email == req.body.email) {
        //     return res.status(404).json({ message: "User with that Email already exists" });
        // }

        // try {
        //     const updatedUser = user.update(userInput)
        //     return res.status(202).json({ message: updatedUser });
        // } catch (error) {
        //     return res.status(400).json({ message: error });
        // }

        try {
            // Check if the user exists with the given username or email
            console.log(req.body.userName);
            console.log(req.body.email);
            const existingUser = await User.findOne({
                where: {
                    // El Op.or es una funcion de Sequalize para hacer consultas complejas en este caso un or
                    [Sequelize.or]: [
                        { userName: req.body.userName },
                        { email: req.body.email }
                    ]
                }
            });
        
            if (existingUser) {
                if (existingUser.userName === req.body.userName) {
                    return res.status(400).json({ message: "User with that username already exists" });
                }
                if (existingUser.email === req.body.email) {
                    return res.status(400).json({ message: "User with that email already exists" });
                }
            }
        
            // Si el usuario no existe hacemos el update
            const updatedUser = await user.update(userInput);
            return res.status(200).json({ message: "User updated successfully", user: updatedUser });
        } catch (error) {
            return res.status(500).json({ message: "Internal server error", error: error.message });
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
    updateUser
};