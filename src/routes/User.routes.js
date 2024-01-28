const express = require('express');
const router = express.Router();
// import the controller functions
const UserController = require('../controllers/User.controller.js');
// import the middlewares
const UsersMiddlewares = require('../middlewares/Users.middlewares.js');

// USERS ROUTES
router.get('/user/get', UserController.getAllUsers);
// router.get('/get/:id', UserController.getUserById);
router.post('/user/register', UsersMiddlewares.verifyUserData, UsersMiddlewares.verificationEmail, UserController.registerUser);

module.exports = router;