const { response } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generarJWT } = require('../helpers/jwt');

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

        // Generar JWT
        const token = await generarJWT( user.id, user.name, user.email, user.userType );

        res.status( 202 ).json({
            ok: true,
            uid: user.id,
            name: user.name,
            email: user.email,
            userType: user.userType,
            token
        });

    } catch (error) {
        return res.status( 500 ).json({
            ok: false,
            msg: 'Por favor hable con el Administrador'
        });
    }

}

const revalidateToken = async ( req, res = response ) => {

    const { uid, name, email, userType } = req;
    // console.log(req);
    
    const token = await generarJWT( uid, name, email, userType );

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
    revalidateToken
};