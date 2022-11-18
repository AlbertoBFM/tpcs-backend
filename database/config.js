const mongoose = require('mongoose');

const dbConnection = async () => {
    try {
        console.log('Connecting...');
        await mongoose.connect( process.env.DB_CNN );
        // await mongoose.connect(process.env.MONGODB_URI)
        console.log('DB Online');
    } catch ( error ) {
        console.log( error );
        throw new mongoose.Error('Error al conectar con la BD');
    }
}

module.exports = {
    dbConnection
}