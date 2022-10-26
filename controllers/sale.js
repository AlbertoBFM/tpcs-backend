const { response } = require('express');
const { formatDate } = require('../helpers/formatDate');
const Product = require('../models/Product');
const Sale = require('../models/Sale');
const User = require('../models/User');
const PDF = require('pdfkit');
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
            const modifiedStartDate = formatDate( new Date( startDate ), 1);
            const modifiedEndDate = formatDate( new Date( endDate ), 2);
            query.date = { $gte: modifiedStartDate, $lt: modifiedEndDate };
        }
        else{
            const startDate = formatDate( new Date(), 0 );
            const endDate = formatDate( new Date(), 1 );
            query.date = { $gte: startDate, $lt: endDate };
        }
        // console.log({query});
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
        console.log(req.body.date);
        // req.body.date = new Date().toISOString();
        // console.log(req.body.date);
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
const data = {
  users: [
    {
      name: "KANE WILLIAMSONs",
      age: 32,
      country: "NEW ZEALAND"
    },
    {
      name: "ROSS TAYLOR",
      age: 38,
      country: "NEW ZEALAND"
    },
    {
      name: "TOM LATHAM",
      age: 31,
      country: "NEW ZEALAND"
    },
    {
      name: "TIM SOUTHEE",
      age: 33,
      country: "NEW ZEALAND"
    }
    ,
    {
      name: "SOY LA MAMADA PAPU",
      age: 33,
      country: "NEW ZEALAND"
    }
  ]
}
//* Create pdf with data
const compile = async (templateName, data) => {
    const filePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`);
    const html = fs.readFileSync(filePath, 'utf-8');
    return hbs.compile(html)(data);
};

const getSalesReportByDates = async ( req, res = response ) => {


    // const { startDate = '', endDate = '' } = req.query; 

    // if ( startDate === '' || endDate === '' )
    //     return res.status( 400 ).json({
    //         ok: false,
    //         msg: 'Datos de fechas invalidas'
    //     });

    const sales = await Sale.find({})
    .lean()
    .populate( 'user', 'name' );
    const browser = await puppeteer.launch();
    const page = await browser.newPage();
console.log({ sales: sales});
console.log(data);
    const content = await compile('saleTemplate', { sales });

    await page.setContent(content);
    await page.emulateMediaType('screen');
    const pdf = await page.pdf({
        //*If you want create pdf file, then add property 'path' in this object
        margin: { top: '50px', right: '50px', bottom: '50px', left: '50px' },
        printBackground: true,
        format: 'A4',
    });
    await browser.close();

    res.contentType('application/pdf');
    return res.status(200).send(pdf);
}

module.exports = {
    getAllSales,
    getSales,
    validateProductStock,
    createSale,
    deleteSale,
    getSalesReportByDates
}