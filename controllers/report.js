const { response } = require('express');
const { formatDateToQuery, formatTime, formatDate } = require('../helpers/formatDate');
const { createPdf } = require('../helpers/generatePDF');
const Sale = require('../models/Sale');

const getSalesReportByDates = async ( req, res = response ) => {
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

module.exports = {
    getSalesReportByDates,
}