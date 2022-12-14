const express = require('express');
require('dotenv').config();
const cors = require('cors');
const { dbConnection } = require('./database/config');

// Create express server

const app = express();

// Data Base
dbConnection();

// CORS
app.use(cors());

// Public directory
app.use( express.static( __dirname + '/public' ));

// Read y Pars of body

app.use( express.json() );

// Routes
app.use( '/api/auth', require('./routes/auth') );
app.use( '/api/category', require('./routes/category') );
app.use( '/api/provider', require('./routes/provider') );
app.use( '/api/product', require('./routes/product') );
app.use( '/api/sale', require('./routes/sale') );
app.use( '/api/saleDetail', require('./routes/saleDetail') );
app.use( '/api/report', require('./routes/report') );
app.use( '/api/user', require('./routes/user') );

app.get( '*', ( req, res ) => {
    res.sendFile( __dirname + '/public/index.html' );
});
// // Public directory
// app.use( express.static('public') );

// // Read y Pars of body

// app.use( express.json() );


// // Routes
// app.use( '/api/auth', require('./routes/auth') );
// app.use( '/api/category', require('./routes/category') );
// app.use( '/api/provider', require('./routes/provider') );
// app.use( '/api/product', require('./routes/product') );
// app.use( '/api/sale', require('./routes/sale') );
// app.use( '/api/saleDetail', require('./routes/saleDetail') );
// app.use( '/api/report', require('./routes/report') );
// app.use( '/api/user', require('./routes/user') );

// Listen requests
app.listen( process.env.PORT, () => {
    console.log( `Servidor corriendo en puerto ${ process.env.PORT }`);
});