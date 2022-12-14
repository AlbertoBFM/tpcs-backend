const { response } = require('express');
const Provider = require('../models/Provider');

const getAllProviders = async ( req, res = response ) => {
    try {
        const providers = await Provider.find().select('name');
        return res.status( 200 ).json({
            ok: true,
            providers
        });
    } catch (error) {
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });
    }
}

const getProviders = async ( req, res = response ) => {
    try {
        const { limit = 5, page = 1, name = '', phone = '' } = req.query; 
        const searchedName = name.toUpperCase().trim();
        const searchedPhone = phone.trim().replace('+', '\\+');

        const providers = await Provider.paginate(
            { 
                name: { $regex: '.*' + searchedName + '.*' },
                phone: { $regex: '.*' + searchedPhone + '.*' },
            }, 
            { limit, page }
        );
        
        return res.status( 200 ).json({
            ok: true,
            providers
        });
    } catch (error) {
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });
    }
}

const createProvider = async ( req, res = response ) => {

    const { name, phone } = req.body;

    try {

        const providerByName = await Provider.findOne({ name: name.toUpperCase().trim() });

        if ( providerByName )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un proveedor existe con ese nombre'
            });

        const providerByPhone = await Provider.findOne({ phone: phone.trim() });

        if ( providerByPhone )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un proveedor existe con ese Celular'
            });
        
        req.body.name = req.body.name.toUpperCase().trim(); 
        const newProvider = new Provider( req.body );
        
        const savedProvider = await newProvider.save();

        return res.status( 201 ).json({
            ok: true,
            provider: savedProvider
        });

    } catch (error) {
        
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });

    }

}

const updateProvider = async ( req, res = response ) => {

    const providerId = req.params.id;
    const { name, phone } = req.body;

    try {
        
        const provider = await Provider.findById( providerId ); //* buscar si proveedor existe
        
        if ( !provider )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de provider no existe'
            });

        const providerByName = await Provider.findOne({ name: name.toUpperCase().trim(), _id: { $ne: providerId } }); //* Busca si existe un proveedor con el mismo nombre, exceptuando la provider que se actualizar?? 
        
        if ( providerByName )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un proveedor existe con ese nombre'
            });

        const providerByPhone = await Provider.findOne({ phone: phone.trim(), _id: { $ne: providerId } }); //* Busca si existe un proveedor con el mismo nombre, exceptuando la proveedor que se actualizar?? 
    
        if ( providerByPhone )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un proveedor existe con ese Celular'
            });

            
        req.body.name = req.body.name.toUpperCase().trim(); 
        const updatedProvider = await Provider.findByIdAndUpdate( providerId, req.body, { new: true } ); //* "new: true" es para que devuelva el proveedor actualizada

        return res.status( 200 ).json({
            ok: true,
            updatedProvider
        });

    } catch (error) {
        
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });

    }

}

const deleteProvider = async ( req, res = response ) => {

    const providerId = req.params.id;

    try {
        
        const provider = await Provider.findById( providerId ); //* buscar si proveedor existe
        
        if ( !provider )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de proveedor no existe'
            });

        const deletedProvider = await Provider.findByIdAndDelete( providerId );

        return res.status( 200 ).json({
            ok: true,
            deletedProvider
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
    getAllProviders,
    getProviders,
    createProvider,
    updateProvider,
    deleteProvider
}