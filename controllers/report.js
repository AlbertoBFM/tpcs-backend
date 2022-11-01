const { response } = require('express');
const { formatDateToQuery, formatTime, formatDate } = require('../helpers/formatDate');
const { createPdf } = require('../helpers/generatePDF');
const Sale = require('../models/Sale');
const Product = require('../models/Product');
const SaleDetail = require('../models/SaleDetail');

const getSalesReport = async ( req, res = response ) => {
    const { startDate = '', endDate = '' } = req.query;

    if ( startDate === '' || endDate === '' )
        return res.status( 400 ).json({
            ok: false,
            msg: 'No se puede generar el PDF con datos invalidos'
        });
    //* Buscar por Rango de Fechas
    const start = formatDateToQuery( new Date( startDate ), 1);
    const end = formatDateToQuery( new Date( endDate ), 2);
    const templateStart = formatDate(new Date( startDate ), 1);
    const templateEnd = formatDate(new Date( endDate ), 1);
    const today = formatTime( new Date() );
    let totalSum = 0;
    const sales = await Sale.find({ date: { $gte: start, $lt: end } }).lean().populate( 'user', 'name' ).sort({ date: 1 });
    const salesDates = sales.map( (sale, index) => {
        sale.index = index + 1;
        sale.date = formatTime(sale.date);
        totalSum += sale.total;
        return sale;
    });

    const pdf = await createPdf({ template: 'saleTemplate', data: { salesDates, start: templateStart, end: templateEnd, today, totalSum } });

    res.contentType('application/pdf');
    return res.status(200).send(pdf);
}

const getSalesDetailsReport = async ( req, res = response ) => {
    const { startDate = '', endDate = '' } = req.query;

    const salesDetails = await SaleDetail.find({}).lean()
        .populate({ path: 'sale', select: 'date' })
        .populate({ 
            path: 'product', 
            select: 'name category provider', 
            populate: [
                { path: 'category', model: 'Category', select: 'name' }, 
                { path: 'provider', model: 'Provider', select: 'name' }
            ] 
        })
    const start = new Date(startDate);
    const end = new Date(endDate);
    const endF = new Date (end.setDate( end.getDate() + 1 ))
    
    const filteredDetails = salesDetails.filter( saleDetail => {
        const date = new Date(saleDetail.sale.date);
        date.setHours( date.getHours() - 4 );
        return date >= start && date < endF;
    });
    // const salesDetails = await SaleDetail.aggregate([
    //     // { $group: {
    //     //         _id: '$product',
    //     //         totalQuantity: { $sum: "$quantity" },
    //     //         subTotals: { $sum: "$subtotal" },
    //     //         product: { $first: '$product' },
    //     //         // sale: { $first: '$sale' },
    //     // }},
    //     { $lookup: {
    //         from: 'products',
    //         localField: 'product',
    //         foreignField: '_id',
    //         as: 'product',
    //         pipeline: [
    //             { $lookup: {
    //                     from: 'categories',
    //                     localField: 'category',
    //                     foreignField: '_id',
    //                     as: 'category',
    //             }},
    //             { $lookup: {
    //                     from: 'providers',
    //                     localField: 'provider',
    //                     foreignField: '_id',
    //                     as: 'provider',
    //             }},
    //             { $unwind: '$category' },
    //             { $unwind: '$provider' },
    //         ],
    //     }},
    //     { $lookup: {
    //         from: 'sales',
    //         localField: 'sale',
    //         foreignField: '_id',
    //         pipeline: [
    //             { $match : { $and: [ {date: { $gte: new Date(start) }}, {date: { $lt: new Date(end) }} ] }}, 
    //         ],
    //         as: 'sale',
    //     }},
    //     { $unwind: '$product' },
    //     { $project: {
    //         _id: 1,
    //         quantity: 1,
    //         subtotal: 1,
    //         product: {
    //             _id: 1,
    //             name: 1,
    //             category: { name: 1 },
    //             provider: { name: 1 }
    //         },
    //         sale: 1,
    //         totalQuantity: 1,
    //         subTotals: 1
    //     }},
    // ]);

    // const carajo = salesDetails.filter( saleDetail => saleDetail.sale.length !== 0 );

    const idProducts = Array.from(new Set(filteredDetails.map( saleDetail => saleDetail.product._id )));
    
    const details = idProducts.map( idProduct => {
        const detail = filteredDetails.find( detail => detail.product._id === idProduct );
        const quantitySum = filteredDetails.filter( detail => detail.product._id === idProduct ).map( detail => detail.quantity ).reduce( (a,b) => a + b );
        const saleSum = filteredDetails.filter( detail => detail.product._id === idProduct ).map( detail => detail.subtotal ).reduce( (a,b) => a + b );

        return {
            product: { id: idProduct, name: detail.product.name, category: detail.product.category.name, provider: detail.product.provider.name },
            quantitySum,
            saleSum
        }
    });

    const templateStart = formatDate(new Date( startDate ), 1);
    const templateEnd = formatDate(new Date( endDate ), 1);
    const today = formatTime( new Date() );
    let totalSales = 0, totalQuantity = 0;
    const productsDetails = details.map( (detail, index) => {
        detail.index = index + 1;
        totalQuantity += detail.quantitySum;
        totalSales += detail.saleSum;
        return detail;
    });

    const pdf = await createPdf({ template: 'productSaleTemplate', data: { productsDetails, start: templateStart, end: templateEnd, today, totalQuantity, totalSales, } });

    res.contentType('application/pdf');
    return res.status(200).send(pdf);
}

const getProductsReport = async ( req, res = response ) => {
    const today = formatTime( new Date() );
    const products = await Product.find({}).lean()
        .populate( 'category', 'name' )
        .populate( 'provider', 'name' )
        .sort({ name: 1 });

    const productsList = products.map( (product, index) => {
        product.index = index + 1;
        return product;
    });

    const pdf = await createPdf({ template: 'productsTemplate', data: { productsList, today } });

    res.contentType('application/pdf');
    return res.status(200).send(pdf);
}

module.exports = {
    getSalesReport,
    getSalesDetailsReport,
    getProductsReport
}