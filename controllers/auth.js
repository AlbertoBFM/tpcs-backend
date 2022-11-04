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

        if ( !user.enabled )
            return res.status( 400 ).json({
                ok: false,
                msg: 'No tiene acceso al Sistema, comuniquese con el Administrador'
            });

        const token = await generarJWT( user.id, user.name, user.email, user.userType );

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

const revalidateToken = async ( req, res = response ) => {

    const { uid, name, email, userType } = req;
    
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

const updateUser = async ( req, res = response ) => {
    const userId = req.params.id;
    const { name, email } = req.body;
    console.log({userId});
    try {
        const user = await User.findById(userId);
        if ( !user )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de Usuario no existe'
            });

        const userByName = await User.findOne({ name: name.toUpperCase().trim(), _id: { $ne: userId } });
        if ( userByName )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un usuario existe con ese Nombre'
            });

        const userByEmail = await User.findOne({ email: email.toLowerCase().trim(), _id: { $ne: userId } });
        if ( userByEmail )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un usuario existe con ese email'
            });

        const newName = name.toUpperCase().trim(); 
        const newEmail = email.toLowerCase().trim(); 

        const updatedUser = await User.findByIdAndUpdate(userId, { $set: { name: newName, email: newEmail } });

        return res.status( 200 ).json({
            ok: true,
            updatedUser,
            msg: 'Usuario Actualizado'
        });
    } catch (error) {
        console.log(error);
        return res.status( 500 ).json({
            ok: false,
            msg: 'Por favor hable con el Administrador'
        });
    }
}

const updatePassword = async ( req, res = response ) => {
    const userId = req.params.id;
    const { oldPassword, password, confirmPassword } = req.body;
    // console.log({userId});
    try {
        const user = await User.findById(userId);
        if ( !user )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de Usuario no existe'
            });

        const validPassword = bcrypt.compareSync( oldPassword, user.password );
        if ( !validPassword )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Contraseña incorrecta'
            });

        if ( password !== confirmPassword )
            return res.status( 400 ).json({
                ok: false,
                msg: 'La contraseña nueva y la de confirmación deben ser iguales'
            });

        // Encriptar contraseña
        const salt = bcrypt.genSaltSync();
        const newPassword = bcrypt.hashSync( password, salt );

        await User.findByIdAndUpdate(userId, { $set: { password: newPassword } });

        return res.status( 200 ).json({
            ok: true,
            msg: 'Contraseña actualizada'
        });
    } catch (error) {
        console.log(error);
        return res.status( 500 ).json({
            ok: false,
            msg: 'Por favor hable con el Administrador'
        });
    }
}

module.exports = {
    loginUser,
    revalidateToken,
    updateUser,
    updatePassword
};