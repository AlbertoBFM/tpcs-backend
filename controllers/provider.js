const { response } = require('express');
const Provider = require('../models/Provider');


const getProviders = async ( req, res = response ) => {

    const providers = await Provider.find();

    return res.status( 200 ).json({
        ok: true,
        providers
    });

}

const createProvider = async ( req, res = response ) => {

    const { name, phone } = req.body;

    try {

        const providerByName = await Provider.findOne({ name: name.toUpperCase() });

        if ( providerByName )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un proveedor existe con ese nombre'
            });

        const providerByPhone = await Provider.findOne({ phone });

        if ( providerByPhone )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un proveedor existe con ese Celular'
            });
        
        req.body.name = req.body.name.toUpperCase(); 
        const newProvider = new Provider( req.body );
        
        const savedProvider = await newProvider.save();

        return res.status( 201 ).json({
            ok: true,
            savedProvider
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

        const providerByName = await Provider.findOne({ name: name.toUpperCase(), _id: { $ne: providerId } }); //* Busca si existe un proveedor con el mismo nombre, exceptuando la provider que se actualizará 
        
        if ( providerByName )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un proveedor existe con ese nombre'
            });

        const providerByPhone = await Provider.findOne({ phone, _id: { $ne: providerId } }); //* Busca si existe un proveedor con el mismo nombre, exceptuando la proveedor que se actualizará 
    
        if ( providerByPhone )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un proveedor existe con ese Celular'
            });

            
        req.body.name = req.body.name.toUpperCase(); 
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
    getProviders,
    createProvider,
    updateProvider,
    deleteProvider
}