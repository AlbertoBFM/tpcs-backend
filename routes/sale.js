/**
 * * Sale Routes
 * * host + /api/sale
*/
const { Router } = require('express');
const { check } = require('express-validator');
const { fieldValidators } = require('../middlewares/fieldValidator');
const { validateJWT } = require('../middlewares/validateJWT');
const { getSales, createSale, deleteSale, validateProductStock, getAllSales } = require('../controllers/sale');

const router = Router();

router.use( validateJWT );

// Get All Sales
router.get( '/all', getAllSales );
// Get Sales
router.get( '/', getSales );
// Validate product stock
router.post( '/validateStock', validateProductStock );

// Create Sale
router.post( 
    '/',
    [
        check('date', 'La fecha y hora de la venta son invalidas').isNumeric(),
        check('total', 'El total de la venta es invalido').isNumeric(),
        fieldValidators
    ], 
    createSale
);

// Delete Sale
router.delete( '/:id', deleteSale );

module.exports = router;