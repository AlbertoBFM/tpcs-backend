const { response } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');

const getUsers = async ( req, res = response ) => {

    const users = await User.find();

    return res.status( 200 ).json({
        ok: true,
        users
    });

}

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
        
        return res.status( 201 ).json({
            ok: true,
            user: { 
                    _id: newUser.id,
                    name: newUser.name,
                    email: newUser.email,
                }
        });

    } catch (error) {
        console.log(error);
        return res.status( 500 ).json({
            ok: false,
            msg: 'Por favor hable con el Administrador'
        });
    }

}

const deleteUser = async ( req, res = response ) => {

    const userId = req.params.id;

    try {
        
        const user = await User.findById( userId ); //* buscar si usuario existe
        
        if ( !user )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de Usuario no existe'
            });

        const deletedUser = await User.findByIdAndDelete( userId );

        return res.status( 200 ).json({
            ok: true,
            deletedUser
        });

    } catch (error) {
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });
    }

}

module.exports = {
    getUsers,
    createUser,
    deleteUser
};