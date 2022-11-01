/**
 * * Report Routes
 * * host + /api/report
*/
const { Router } = require('express');
const { validateJWT } = require('../middlewares/validateJWT');
const { getSalesReport, getSalesDetailsReport, getProductsReport } = require('../controllers/report');

const router = Router();

router.use( validateJWT );

// Sale Report By Dates
router.get( '/salesByDates', getSalesReport );
router.get( '/salesDetailsByDates', getSalesDetailsReport );
router.get( '/products', getProductsReport );

module.exports = router;