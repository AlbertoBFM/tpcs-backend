/**
 * * Report Routes
 * * host + /api/report
*/
const { Router } = require('express');
const { validateJWT } = require('../middlewares/validateJWT');
const { getSalesReportByDates } = require('../controllers/report');

const router = Router();

router.use( validateJWT );

// Sale Report By Dates
router.get( '/salesByDates', getSalesReportByDates );

module.exports = router;