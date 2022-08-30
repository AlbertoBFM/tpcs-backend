const { response } = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Provider = require('../models/Provider');

const getProducts = async ( req, res = response ) => {

    const products = await Product.find()
                                    .populate( 'category', 'name' )
                                    .populate( 'provider', 'name' );

    return res.status( 200 ).json({
        ok: true,
        products
    });

}

const createProduct = async ( req, res = response ) => {

    const { name, purchasePrice, salePrice, category, provider } = req.body;

    try {

        const productByName = await Product.findOne({ name: name.toUpperCase() });

        if ( productByName )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un producto existe con ese nombre'
            });

        if ( purchasePrice >= salePrice )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El precio de compra no puede ser mayor o igual al precio de venta'
            });

        const categoryById = await Category.findById( category );

        if ( !categoryById )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de la categoría no existe'
            });

        const providerById = await Provider.findById( provider );

        if ( !providerById )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id del proveedor no existe'
            });
        
        req.body.name = name.toUpperCase(); 
        const newProduct = new Product( req.body );
        
        const savedProduct = await newProduct.save();

        return res.status( 201 ).json({
            ok: true,
            product: savedProduct
        });

    } catch (error) {
        
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });

    }

}

const updateProduct = async ( req, res = response ) => {

    const productId = req.params.id;
    const { name, purchasePrice, salePrice, category, provider } = req.body;

    try {
        
        const product = await Product.findById( productId ); //* buscar si producto existe
        
        if ( !product )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de producto no existe'
            });

        const productByName = await Product.findOne({ name: name.toUpperCase(), _id: { $ne: productId } }); //* Busca si existe un producto con el mismo nombre, exceptuando el producto que se actualizará 
        
        if ( productByName )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un producto existe con ese nombre'
            });
    
        if ( purchasePrice >= salePrice )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El precio de compra no puede ser mayor o igual al precio de venta'
            });

        const categoryById = await Category.findById( category );

        if ( !categoryById )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de la categoría no existe'
            });

        const providerById = await Provider.findById( provider );

        if ( !providerById )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id del proveedor no existe'
            });

            
        req.body.name = name.toUpperCase(); 
        const updatedProduct = await Product.findByIdAndUpdate( productId, req.body, { new: true } ); //* "new: true" es para que devuelva el producto actualizada

        return res.status( 200 ).json({
            ok: true,
            updatedProduct
        });

    } catch (error) {
        
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });

    }

}

const deleteProduct = async ( req, res = response ) => {

    const productId = req.params.id;

    try {
        
        const productById = await Product.findById( productId ); //* buscar si producto existe
        
        if ( !productById )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de producto no existe'
            });

        const deletedProduct = await Product.findByIdAndDelete( productId );

        return res.status( 200 ).json({
            ok: true,
            deletedProduct
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
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
}