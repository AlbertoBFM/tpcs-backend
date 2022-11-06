const { response } = require('express');
const Product = require('../models/Product');
const Category = require('../models/Category');
const Provider = require('../models/Provider');
const SaleDetail = require('../models/SaleDetail');

const getAllProducts = async ( req, res = response ) => {
    try {
        const products = await Product.find().select('name stock purchasePrice')
                                        .populate( 'category', 'name' )
                                        .populate( 'provider', 'name' );
        return res.status( 200 ).json({
            ok: true,
            products
        });
    } catch (error) {
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });
    }
}

const getProducts = async ( req, res = response ) => {
    try {
        const { limit = 5, page = 1, name = '', category = '', provider = '' } = req.query; 
        const searchedName = name.toUpperCase().trim();
        const searchedCategory = category.toUpperCase().trim();
        const searchedProvider = provider.toUpperCase().trim();

        let query = { name: { $regex: '.*' + searchedName + '.*' } }
        let categoryByName = {}, providerByName = {};
        if ( searchedCategory !== '' ) {
            categoryByName = await Category.findOne({ name: searchedCategory }) || {}; 
            if ( categoryByName._id === undefined ){
                return res.status( 200 ).json({
                    ok: true,
                    products: { docs: [], totalDocs: 0, limit: 5, totalPages: 1, page: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null }
                });
            }
            query.category = { _id: categoryByName._id };
        }
        if ( searchedProvider !== '' ) {
            providerByName = await Provider.findOne({ name: searchedProvider }) || {};   
            if ( providerByName._id === undefined ){
                return res.status( 200 ).json({
                    ok: true,
                    products: { docs: [], totalDocs: 0, limit: 5, totalPages: 1, page: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null }
                }); 
            }
            query.provider ={ _id: providerByName._id };
        }

        // const { _id: categoryId } = await Category.findOne({ name: searchedCategory }) || {}; 
        // const { _id: providerId } = await Provider.findOne({ name: searchedProvider }) || {}; 
        // console.log({ searchedName, searchedCategory, categoryId, searchedProvider, providerId });
        // if ( (category !== '' && categoryId === undefined) || (provider !== '' && providerId === undefined) ){ //* Si nos manda categoría o provider con nombres equivocados, directamente mandaremos un arreglo vacio
        //     return res.status( 200 ).json({
        //         ok: true,
        //         products: { docs: [], totalDocs: 0, limit: 5, totalPages: 1, page: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null }
        //     });
        // }
        // const query = {
        //     name: { $regex: '.*' + searchedName + '.*' },
        //     category: { _id: categoryId },
        //     provider: { _id: providerId }
        // };
        // if ( query.category._id === undefined ) delete query.category;
        // if ( query.provider._id === undefined ) delete query.provider;

        const products = await Product.paginate(
            query,
            { 
                limit, 
                page,
                populate: [
                    { path: 'category', select: 'name' },
                    { path: 'provider', select: 'name' },
                ],
            }
        )
        return res.status( 200 ).json({
            ok: true,
            products
        });
    } catch (error) {
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });
    }
}

const createProduct = async ( req, res = response ) => {

    const { name, purchasePrice, salePrice, category, provider } = req.body;

    try {

        const productByName = await Product.findOne({ name: name.toUpperCase().trim() });

        if ( productByName )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Un producto existe con ese nombre'
            });

        if ( Number(purchasePrice) >= Number(salePrice) )
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
        
        req.body.name = name.toUpperCase().trim(); 
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

        const productByName = await Product.findOne({ name: name.toUpperCase().trim(), _id: { $ne: productId } }); //* Busca si existe un producto con el mismo nombre, exceptuando el producto que se actualizará 
        
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

            
        req.body.name = name.toUpperCase().trim(); 
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

        const saleDetailByProduct = await SaleDetail.findOne({ product: productById._id });
        if ( saleDetailByProduct )
            return res.status( 400 ).json({
                ok: true,
                msg: `El producto "${ productById.name }" esta registrado en otras ventas`
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
    getAllProducts,
    getProducts,
    createProduct,
    updateProduct,
    deleteProduct
}