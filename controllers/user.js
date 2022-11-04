const { response } = require('express');
const bcrypt = require('bcryptjs');
const User = require('../models/User');
const Sale = require('../models/Sale');

const getUsers = async ( req, res = response ) => {
    try {
        const { limit = 5, page = 1, name = '', email = '' } = req.query;
        const searchedName = name.toUpperCase().trim();
        const searchedEmail = email.toLowerCase().trim();
        
        const users = await User.paginate(
            { 
                name: { $regex: '.*' + searchedName + '.*' },
                email: { $regex: '.*' + searchedEmail + '.*' },
            }, 
            { 
                limit,
                page,
                sort: { name: 1 } 
            }
        );

        return res.status( 200 ).json({
            ok: true,
            users
        });
    } catch (error) {
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });
    }
}

const toggleEnabledUser = async ( req, res = response ) => {
    const userId = req.params.id;

    try {
        const user = await User.findById( userId ); //* buscar si usuario existe
        if ( !user )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de Usuario no existe'
            });

        await User.findByIdAndUpdate(userId, { $set: { enabled: !user.enabled } });

        return res.status( 200 ).json({
            ok: true,
            msg: 'Usuario Actualizado'
        });
    } catch (error) {
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });
    }
}

const createUser = async ( req, res = response ) => {

    const { name, email, password } = req.body;

    try {

        const userByName = await User.findOne({ name: name.toUpperCase().trim() });
        
        if ( userByName )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un usuario existe con ese Nombre'
            });

        const userByEmail = await User.findOne({ email: email.toLowerCase().trim() });
        
        if ( userByEmail )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un usuario existe con ese email'
            });

        req.body.name = name.toUpperCase().trim(); 
        req.body.email = email.toLowerCase().trim(); 
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

        const saleByUser = await Sale.findOne({ user: user._id });
        if ( saleByUser )
            return res.status( 400 ).json({
                ok: true,
                msg: `El usuario "${ user.name }" tiene ventas registradas`
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
    toggleEnabledUser,
    createUser,
    deleteUser
};