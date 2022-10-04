/**
 * * Category Routes
 * * host + /api/category
*/
const { Router } = require('express');
const { check } = require('express-validator');
const { getCategories, createCategory, updateCategory, deleteCategory, getAllCategories } = require('../controllers/category');
const { fieldValidators } = require('../middlewares/fieldValidator');
const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();

router.use( validateJWT );

// Get Categories
router.get( '/', getCategories );

// Get All Categories
router.get( '/all', getAllCategories );

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