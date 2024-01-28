require('dotenv').config(); // Cargar las variables de entorno

const Sequelize = require('sequelize');
const sequelize = new Sequelize(process.env.BBDD_NAME, process.env.BBDD_USER, process.env.BBDD_PASS, { // bbdd, username, password
  host: process.env.BBDD_HOST,
  dialect: process.env.BBDD_DIALECT,
});

sequelize
  .authenticate()
  .then(() => {
    console.log('Connected successfully to the BBDD.');
  })
  .catch((error) => {
    console.error('Error connecting:', error);
  });