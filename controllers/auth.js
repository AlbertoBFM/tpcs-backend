const { response } = require('express');
const User = require('../models/User');

const createUser = async ( req, res = response ) => {

    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email });
        
        if ( user )
            res.status( 400 ).json({
                ok: false,
                msg: 'Un usuario existe con ese correo'
            });

        const newUser = new User( req.body );
        await newUser.save();
        
        res.status( 201 ).json({
            ok: true,
            uid: newUser.id,
            name: newUser.name
        });
    } catch (error) {
        res.status( 500 ).json({
            ok: false,
            msg: 'Por favor hable con el Administrador'
        });
    }

}

const loginUser = ( req, res = response ) => {

    const { email, password } = req.body;

    res.status( 202 ).json({
        ok: true,
        message: 'Login',
        email,
        password
    });

}

const revalidateToken = ( req, res = response ) => {

    res.json({
        ok: true,
        message: 'Renew'
    });

}

module.exports = {
    createUser,
    loginUser,
    revalidateToken
};