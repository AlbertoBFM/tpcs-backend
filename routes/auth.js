/**
 * * Users Routes // Auth
 * * host + /api/auth
*/
const { Router } = require('express');
const { check } = require('express-validator');
const { fieldValidators } = require('../middlewares/fieldValidator');
const { createUser, loginUser, revalidateToken } = require('../controllers/auth');
const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();

router.post( 
    '/new',
    [   // Middlewares
        check('name', 'El nombre es obligatorio').not().isEmpty(),
        check('email', 'El email es obligatorio').isEmail(),
        check('password', 'El password deber ser de 6 caracteres').isLength({ min: 6 }),
        fieldValidators
    ], 
    createUser 
);

router.post( 
    '/',
    [   // Middlewares
        check('email', 'El email es obligatorio').isEmail(),
        check('password', 'El password deber ser de 6 caracteres').isLength({ min: 6 }),
        fieldValidators
    ],  
    loginUser 
);

router.get( '/renew', validateJWT, revalidateToken );

module.exports = 
    router
;