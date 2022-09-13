/**
 * * Category Routes
 * * host + /api/category
*/
const { Router } = require('express');
const { check } = require('express-validator');
const { getCategories, createCategory, updateCategory, deleteCategory } = require('../controllers/category');
const { fieldValidators } = require('../middlewares/fieldValidator');
const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();

router.use( validateJWT );

// Get Categories
router.get( '/', getCategories );

// Create Category
router.post( 
    '/',
    [
        check('name', 'El nombre de la categoría es obligatoria').not().isEmpty(),
        fieldValidators
    ], 
    createCategory 
);

// Update Category
router.put( 
    '/:id',
    [
        check('name', 'El nombre de la categoría es obligatoria').not().isEmpty(),
        fieldValidators
    ], 
    updateCategory 
);

// Delete Category
router.delete( '/:id', deleteCategory );

module.exports = router;