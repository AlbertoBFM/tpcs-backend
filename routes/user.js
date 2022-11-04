/**
 * * User Routes
 * * host + /api/user
*/
const { Router } = require('express');
const { check } = require('express-validator');
const { fieldValidators } = require('../middlewares/fieldValidator');
const { validateJWT } = require('../middlewares/validateJWT');
const { getUsers, createUser, deleteUser, toggleEnabledUser } = require('../controllers/user');

const router = Router();

router.use( validateJWT );

// Get Users
router.get( '/', getUsers );

// Create User
router.post( 
    '/new',
    [   // Middlewares
        validateJWT,
        check('name', 'El nombre es obligatorio').not().isEmpty(),
        check('email', 'El email es obligatorio').isEmail(),
        check('password', 'El password deber ser de 8 caracteres').isLength({ min: 8 }),
        fieldValidators
    ], 
    createUser 
);

// Delete User
router.delete( '/:id', deleteUser );

// Enabled User
router.post( '/enabled/:id', toggleEnabledUser );

module.exports = router;