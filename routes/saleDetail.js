/**
 * * SaleDetail Routes
 * * host + /api/saleDetail
*/
const { Router } = require('express');
const { check } = require('express-validator');
const { fieldValidators } = require('../middlewares/fieldValidator');
const { validateJWT } = require('../middlewares/validateJWT');
const { getSalesDetails, createSaleDetail, deleteSaleDetail } = require('../controllers/saleDetail');

const router = Router();

router.use( validateJWT );

// Get Sales
router.get( '/', getSalesDetails );

// Create Sale
router.post( 
    '/',
    [
        check('quantity', 'La cantidad del producto en la venta es invalida').isNumeric(),
        check('subtotal', 'El subtotal de la venta es invalido').isNumeric(),
        fieldValidators
    ], 
    createSaleDetail
);

// Delete Sale
router.delete( '/:id', deleteSaleDetail );

module.exports = router;