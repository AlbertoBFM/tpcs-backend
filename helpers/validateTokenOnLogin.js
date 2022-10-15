const jwt = require('jsonwebtoken');

const validateTokenOnLogin = ( token ) => {
    try {
        const { uid, name, email, userType } = jwt.verify(
            token,
            process.env.SECRET_JWT_SEED
        );

        return {
            uid,
            name,
            email,
            userType
        }
    } catch (error) {
        // console.log('Token no valido para iniciar sesión');
        console.log('El token ya no es valido, Cambio de token');
        // console.log('Error: ', error);
        return;
    }
}

module.exports = {
    validateTokenOnLogin
}