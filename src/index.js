const express = require('express');
const app = express();
require('dotenv').config(); // Cargar las variables de entorno
const port = process.env.PORT || 4000;

// Añadir middleware para que Express pueda procesar JSON
app.use(express.json());

// Make the connection with the BBDD
const { sequelize } = require('./database/connection.js');

// Empezar el servidor
app.listen(port, () => {
    console.log(`Server listening on port ${port}`);
});
