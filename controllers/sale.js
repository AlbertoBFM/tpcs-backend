const { response } = require('express');
const { formatDateToQuery, formatTime, formatDate, formatDateByMonths, formatDateByDay } = require('../helpers/formatDate');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const User = require('../models/User');
const puppeteer = require('puppeteer');
const path = require('path');
const fs = require('fs');
const hbs = require('handlebars');

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
        const searchedUser = user.toUpperCase().trim();
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
            const userByName = await User.findOne({ name: { $regex: '.*' + searchedUser + '.*' } }) || {}; 
            if ( userByName._id === undefined ){
                return res.status( 200 ).json({
                    ok: true,
                    products: { docs: [], totalDocs: 0, limit: 5, totalPages: 1, page: 1, pagingCounter: 1, hasPrevPage: false, hasNextPage: false, prevPage: null, nextPage: null }
                });
            }
            query.user = { _id: userByName._id };
        }

        if (startDate !== '' && endDate !== '') { //* Buscar por Rango de Fechas
            const modifiedStartDate = formatDateToQuery( new Date( startDate ), 1);
            const modifiedEndDate = formatDateToQuery( new Date( endDate ), 2);
            query.date = { $gte: modifiedStartDate, $lt: modifiedEndDate };
        }
        else{
            const startDate = formatDateToQuery( new Date(), 0 );
            const endDate = formatDateToQuery( new Date(), 1 );
            query.date = { $gte: startDate, $lt: endDate };
        }
        // console.log({query});
        const sales = await Sale.paginate( query, { limit, page, populate: { path: 'user', select: 'name' }, sort: { date: 1 } } );

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

const getSalesChart = async ( req, res = response ) => {
    try {
        const { start, end, days, monthName } = formatDateByMonths();

        const sales = await Sale.find({ date: { $gte: start, $lt: end } }).lean().populate( 'user', 'name' ).sort({ date: 1 });        
        const daysArray = Array.from({ length: days }, (_, index) => index + 1);

        const filteredSales = daysArray.map( day => {
            const amountSales = sales.filter( sale => {
                const date = new Date(sale.date);
                const { startOfDay, endOfDay } = formatDateByDay( day, new Date(start) );

                return date >= new Date(startOfDay) && date < new Date(endOfDay);
            });

            return amountSales.length;
        });

        return res.status(200).json({
            ok: true,
            labels: daysArray,
            datasets: [
                {
                    label: `Ventas de ${ monthName }`,
                    backgroundColor: 'rgb(13, 110, 253)',
                    borderColor: 'rgb(13, 110, 253)',
                    data: filteredSales
                }
            ]
        });
    } catch (error) {
        console.log({error});
        return res.status(500).json({
            ok: true,
            msg: 'Error al Obtener los datos para el gr??fico'
        });
    }
}

module.exports = {
    getAllSales,
    getSales,
    validateProductStock,
    createSale,
    deleteSale,
    getSalesChart
}