const { response } = require('express');
const Product = require('../models/Product');
const Sale = require('../models/Sale');

const getSales = async ( req, res = response ) => {

    const sales = await Sale.find()
                                .populate( 'user', 'name' );

    return res.status( 200 ).json({
        ok: true,
        sales
    });

}

const validateProductStock = async (req, res = response) => {
    try {
        const { _id, quantity } = req.body;

        if ( quantity < 1 )
            return res.status( 400 ).json({
                ok: false,
                msg: 'La cantidad a vender debe ser mayor a 1'
            });

        const product = await Product.findById( _id ); //* buscar si producto existe
        if ( !product )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de producto no existe'
            });

        if ( Number(product.stock) < Number(quantity) ) //* Si el stock del producto es menor a lo que se quiere vender
            return res.status( 400 ).json({
                ok: false,
                msg: `Stock insuficiente de "${ product.name }"`
            });

        return res.status( 200 ).json({
            ok: true,
            msg: 'El producto puede ser vendido'
        });
    } catch (error) {
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });
    }
}

const createSale = async ( req, res = response ) => {

    try {
        
        const newSale = new Sale( req.body );
        newSale.user = req.uid; 
        
        const savedSale = await newSale.save();

        return res.status( 201 ).json({
            ok: true,
            sale: savedSale
        });

    } catch (error) {
        
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });

    }

}

const deleteSale = async ( req, res = response ) => {

    const saleId = req.params.id;

    try {
        
        const sale = await Sale.findById( saleId ); //* buscar si venta existe
        
        if ( !sale )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de venta no existe'
            });

        const deletedSale = await Sale.findByIdAndDelete( saleId );

        return res.status( 200 ).json({
            ok: true,
            deletedSale
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
    getSales,
    validateProductStock,
    createSale,
    deleteSale
}