/**
 * * Product Routes
 * * host + /api/product
*/
const { Router } = require('express');
const { check } = require('express-validator');
const { getProducts, createProduct, updateProduct, deleteProduct } = require('../controllers/product');
const { numberRange } = require('../helpers/validateInput');
const { fieldValidators } = require('../middlewares/fieldValidator');
const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();

router.use( validateJWT );

// Get Products
router.get( '/', getProducts );

// Create Product
router.post( 
    '/',
    [
        check('name', 'El nombre del producto es obligatorio').not().isEmpty(),
        check('stock', 'El stock del producto es invalido').custom( value => numberRange( value, 1, 1000 ) ),
        check('purchasePrice', 'El precio de compra del producto es invalido').custom( value => numberRange( value, 1, 19999 ) ),
        check('salePrice', 'El precio de venta del producto es invalido').custom( value => numberRange( value, 1, 19999 ) ),
        check('category', 'La categoría del producto es obligatoria').not().isEmpty(),
        check('provider', 'El proveedor del producto es obligatorio').not().isEmpty(),
        fieldValidators
    ], 
    createProduct
);

// Update Product
router.put( 
    '/:id',
    [
        check('name', 'El nombre del producto es obligatorio').not().isEmpty(),
        check('stock', 'El stock del producto es invalido').custom( value => numberRange( value, 1, 1000 ) ),
        check('purchasePrice', 'El precio de compra del producto es invalido').custom( value => numberRange( value, 1, 19999 ) ),
        check('salePrice', 'El precio de venta del producto es invalido').custom( value => numberRange( value, 1, 19999 ) ),
        check('category', 'La categoría del producto es obligatoria').not().isEmpty(),
        check('provider', 'El proveedor del producto es obligatorio').not().isEmpty(),
        fieldValidators
    ], 
    updateProduct
);

// Delete Product
router.delete( '/:id', deleteProduct );

module.exports = router;