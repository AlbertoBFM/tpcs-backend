const { response } = require('express');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const SaleDetail = require('../models/SaleDetail');


const getSalesDetails = async ( req, res = response ) => {

    const salesDetails = await SaleDetail.find()
                                            .populate( 'product', 'name salePrice' );

    return res.status( 200 ).json({
        ok: true,
        salesDetails
    });

}

const getDetailBySaleId = async ( req, res = response ) => {

    const saleId = req.params.id;

    const saleDetails = await SaleDetail.find({ sale: saleId })
                                            .populate( 'product', 'name salePrice' );

    return res.status( 200 ).json({
        ok: true,
        saleDetails
    });

}

const createSaleDetail = async ( req, res = response ) => {

    const { sale, product, quantity } = req.body;

    try {
        
        const saleById = await Sale.findById( sale ); //* buscar si venta existe
    
        if ( !saleById )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de venta no existe'
            });

        const productById = await Product.findById( product ); //* buscar si producto existe
        
        if ( !productById )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de producto no existe'
            });

        if ( Number(productById.stock) < Number(quantity) ) //* Si el stock del producto es menor a lo que se quiere vender
            return res.status( 400 ).json({
                ok: false,
                msg: `Stock insuficiente de "${ product.name }"`
            });
        
        const newSaleDetail = new SaleDetail( req.body );
        
        const savedSaleDetail = await newSaleDetail.save();

        await Product.findByIdAndUpdate( product, { $set: { stock: productById.stock - quantity } } );

        return res.status( 201 ).json({
            ok: true,
            saleDetail: savedSaleDetail
        });

    } catch (error) {
        
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });

    }

}

const deleteSaleDetail = async ( req, res = response ) => {

    const saleDetailId = req.params.id;

    try {
        
        const saleDetail = await SaleDetail.findById( saleDetailId ); //* buscar si detalle de venta existe
        if ( !saleDetail )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de detalle venta no existe'
            });

        const productById = await Product.findById( saleDetail.product ); //* buscar si producto existe  
        if ( !productById )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de producto no existe'
            }); 

        const deletedSaleDetail = await SaleDetail.findByIdAndDelete( saleDetailId );

        await Product.findByIdAndUpdate( saleDetail.product, { $set: { stock: productById.stock + saleDetail.quantity } } );

        return res.status( 200 ).json({
            ok: true,
            deletedSaleDetail
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
    getSalesDetails,
    getDetailBySaleId,
    createSaleDetail,
    deleteSaleDetail
}