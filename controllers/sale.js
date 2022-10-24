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
            const modifiedEndDate = formatDate( new Date( endDate ), 2 );
            query.date = { $gte: startDate, $lt: modifiedEndDate };
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
  "users": [
    {
      "name": "KANE WILLIAMSON",
      "age": 32,
      "country": "NEW ZEALAND"
    },
    {
      "name": "ROSS TAYLOR",
      "age": 38,
      "country": "NEW ZEALAND"
    },
    {
      "name": "TOM LATHAM",
      "age": 31,
      "country": "NEW ZEALAND"
    },
    {
      "name": "TIM SOUTHEE",
      "age": 33,
      "country": "NEW ZEALAND"
    }
    ,
    {
      "name": "SOY LA MAMADA PAPU",
      "age": 33,
      "country": "NEW ZEALAND"
    }
  ]
}
//* PROBANDO
const compile = async function (templateName, data) {
    const filePath = path.join(process.cwd(), 'templates', `${templateName}.hbs`);
    const html = await fs.readFileSync(filePath, 'utf-8');
    console.log(html)
    return hbs.compile(html)(data);
};
const getSalesReport = async ( req, res = response ) => {
    // Create a browser instance
    const browser = await puppeteer.launch();

    // Create a new page
    const page = await browser.newPage();
    // Para que rederice la data y se cree el pdf con el template
    const content = await compile('saleTemplate', data);

     //Get HTML content from HTML file
    await page.setContent(content);

    //To reflect CSS used for screens instead of print
    await page.emulateMediaType('screen');

    // Downlaod the PDF
    await page.pdf({
        path: 'reports/saleReport.pdf',
        margin: { top: '100px', right: '50px', bottom: '100px', left: '50px' },
        printBackground: true,
        format: 'A4',
    });

    
    // Close the browser instance
    await browser.close();
    res.contentType("application/pdf");
    res.sendFile(path.join(__dirname, '../reports/saleReport.pdf'));

    // const doc = new PDF({ bufferPages: true });

    // const fileName = `Reporte_Venta_${ Date.now() }.pdf`;

    // const stream = res.writeHead(200, {
    //     'Content-Type': 'application/pdf',
    //     'Content-disposition': `attachment;filename=${ fileName }`
    // });

    // doc.on('data', ( data ) => stream.write( data ));
    // doc.on('end', () => stream.end());

    // doc.text('Hola que hace papu, soy un PDF. <h1>SIIUUUUUUU</h1>', 100, 100);

    // doc.end();
    //**otro
    // var doc = new PDF({bufferPages: true});

    // const stream = res.writeHead(200, {
    //     'Content-Type': 'application/pdf',
    //     'Content-disposition': 'attachment;filename=test.pdf',
    // });
    // doc.text(`this is a test text`);
    
    // doc.on('data',  ( data ) => stream.write( data ));
    // doc.on('end', () => { stream.end() });
    
    // doc.end();
    // console.log('jofer');
    // var file = fs.createReadStream('prueba.pdf');
    // console.log('direction: ',__dirname,'../prueba.pdf');
    // var stat = fs.statSync('prueba.pdf');
    // res.setHeader('Content-Length', stat.size);
    // res.setHeader('Content-Type', 'application/pdf');
    // res.setHeader('Content-Disposition', 'attachment; filename=prueba.pdf');
    // file.pipe(res);
}

module.exports = {
    getAllSales,
    getSales,
    validateProductStock,
    createSale,
    deleteSale,
    getSalesReport
}