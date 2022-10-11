const { response } = require('express');
const { formatDate } = require('../helpers/formatDate');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const User = require('../models/User');

const getAllSales = async ( req, res = response ) => {
    try {
        const sales = await Sale.find().populate( 'user', 'name' );
    
        return res.status( 200 ).json({
            ok: true,
            sales
        });
    } catch (error) {
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });
    }
}

const getSales = async ( req, res = response ) => {
    try {
        const { limit = 5, page = 1, user = '', client = '', startDate = '', endDate = '' } = req.query; 
        const searchedUser = user.trim();
        const searchedClient = client.trim();

        if ( !(startDate === '' && endDate === '' || startDate !== '' && endDate !== '') ) { //* el inicio y final deben estar con datos o no estarlos para que realice una consulta
            return res.status( 200 ).json({
                ok: true,
                products: { docs: [], totalDocs: 0, limit: 5, totalPages: 1, page: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null }
            });
        }

        let query = {};
        if ( searchedClient !== '' ) {
            query.client = { $regex: '.*' + searchedClient + '.*' };
        }

        if ( searchedUser !== '' ) { //*Buscar por nombre de Usuario
            const userByName = await User.findOne({ name: searchedUser }) || {}; 
            if ( userByName._id === undefined ){
                return res.status( 200 ).json({
                    ok: true,
                    products: { docs: [], totalDocs: 0, limit: 5, totalPages: 1, page: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null }
                });
            }
            query.user = { _id: userByName._id };
        }

        if (startDate !== '' && endDate !== '') { //* Buscar por Rango de Fechas
            const modifiedEndDate = formatDate( new Date( endDate ), 2 );
            query.date = { $gte: startDate, $lt: modifiedEndDate };
        }
        else{
            const startDate = formatDate( new Date(), 0 );
            const endDate = formatDate( new Date(), 1 );
            query.date = { $gte: startDate, $lt: endDate };
        }
        console.log({query});
        const sales = await Sale.paginate( query, { limit, page, populate: { path: 'user', select: 'name' } } );

        return res.status( 200 ).json({
            ok: true,
            count: sales.docs.length,
            sales
        });
    } catch (error) {
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador',
            error
        });
    }
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
    getAllSales,
    getSales,
    validateProductStock,
    createSale,
    deleteSale
}