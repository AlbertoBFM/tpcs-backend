const { response } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generarJWT } = require('../helpers/jwt');
const { validateTokenOnLogin } = require('../helpers/validateTokenonLogin');

const loginUser = async ( req, res = response ) => {

    const { email, password } = req.body;

    try {
        
        const user = await User.findOne({ email: email.toLowerCase().trim() });

        if ( !user )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El usuario no existe con ese email'
            });
        // Confirmar los passwords
        const validPassword = bcrypt.compareSync( password, user.password );
        
        if ( !validPassword )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Password incorrecto'
            });

        //* Lógica
        //* Nos basamos en el token registrado en el archivo Usuario, si elimina manualmente el storage. Entonces tendrá que esperar a que caduque esa sesión del token y recien podrá iniciar sesión nuevamente
        const logedUser = validateTokenOnLogin( user.token );
        if ( logedUser )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Este usuario ya se encuentra en Sesión'
            });

        const token = await generarJWT( user.id, user.name, user.email, user.userType );

        await User.findByIdAndUpdate( user.id, { $set: { online: true, token } } );

        return res.status( 202 ).json({
            ok: true,
            uid: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            token
        });

    } catch (error) {
        console.log({error});
        return res.status( 500 ).json({
            ok: false,
            msg: 'Por favor hable con el Administrador'
        });
    }

}

const logoutUser = async ( req, res = response ) => {
    try {
        const userId = req.params.id;

        await User.findByIdAndUpdate( userId, { $set: { online: false, token: '' } } );

        res.status( 200 ).json({
            ok: true,
            msg: 'Sesión cerrada con exito'
        });
    } catch (error) {
        console.log({error});
        return res.status( 500 ).json({
            ok: false,
            msg: 'Por favor hable con el Administrador'
        });
    }
}

const revalidateToken = async ( req, res = response ) => {

    const { uid, name, email, userType } = req;
    
    const token = await generarJWT( uid, name, email, userType );
    await User.findByIdAndUpdate( uid, { $set: { online: true, token } } );

    res.json({
        ok: true,
        uid,
        name,
        email,
        userType,
        token
    });

}

module.exports = {
    loginUser,
    logoutUser,
    revalidateToken
};