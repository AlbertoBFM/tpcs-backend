const express = require('express');
require('dotenv').config();
const { dbConnection } = require('./database/config');


// Create express server

const app = express();

// Data Base
dbConnection();

// Public directory
app.use( express.static('public') );

// Read y Pars of body

app.use( express.json() );


// Routes
app.use( '/api/auth', require('./routes/auth') );

// TODO: CRUD: Categories

// Listen requests
app.listen( process.env.PORT, () => {
    console.log( `Servidor corriendo en puerto ${ process.env.PORT }`);
});