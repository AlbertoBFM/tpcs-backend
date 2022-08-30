/**
 * * Provider Routes
 * * host + /api/provider
*/
const { Router } = require('express');
const { check } = require('express-validator');
const { getProviders, createProvider, updateProvider, deleteProvider } = require('../controllers/provider');
const { fieldValidators } = require('../middlewares/fieldValidator');
const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();

router.use( validateJWT );

// Get Providers
router.get( '/', getProviders );

// Create Provider
router.post( 
    '/',
    [
        check('name', 'El nombre del proveedor es obligatorio').not().isEmpty(),
        check('phone', 'El celular del proveedor es obligatorio').not().isEmpty(),
        check('address', 'La dirección del proveedor es obligatorio').not().isEmpty(),
        fieldValidators
    ], 
    createProvider
);

// Update Provider
router.put( 
    '/:id',
    [
        check('name', 'El nombre del proveedor es obligatorio').not().isEmpty(),
        check('phone', 'El celular del proveedor es obligatorio').not().isEmpty(),
        check('address', 'La dirección del proveedor es obligatorio').not().isEmpty(),
        fieldValidators
    ], 
    updateProvider
);

// Delete Provider
router.delete( '/:id', deleteProvider );

module.exports = router;