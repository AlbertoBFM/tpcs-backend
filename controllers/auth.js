const { response } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const { generarJWT } = require('../helpers/jwt');

const createUser = async ( req, res = response ) => {

    const { email, password } = req.body;

    try {

        const user = await User.findOne({ email });
        
        if ( user )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un usuario existe con ese email'
            });

        const newUser = new User( req.body );

        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        newUser.password = bcrypt.hashSync( password, salt );

        await newUser.save();

        // Generar JWT
        // const token = await generarJWT( newUser.id, newUser.name, newUser.email );
        
        return res.status( 201 ).json({
            ok: true,
            user: { 
                    _id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                }
        });

    } catch (error) {
        // console.log(error);
        return res.status( 500 ).json({
            ok: false,
            msg: 'Por favor hable con el Administrador'
        });
        
    }

}

const loginUser = async ( req, res = response ) => {

    const { email, password } = req.body;

    
    try {
        
        const user = await User.findOne({ email });
        
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
        const token = await generarJWT( user.id, user.name, user.email );

        res.status( 202 ).json({
            ok: true,
            uid: user.id,
            name: user.name,
            email: user.email,
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

    const { uid, name, email } = req;
    console.log(req);
    
    const token = await generarJWT( uid, name, email );

    res.json({
        ok: true,
        uid,
        name,
        email,
        token
    });

}

module.exports = {
    createUser,
    loginUser,
    revalidateToken
};