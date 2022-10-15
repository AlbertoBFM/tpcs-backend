/**
 * * Users Routes // Auth
 * * host + /api/auth
*/
const { Router } = require('express');
const { check } = require('express-validator');
const { fieldValidators } = require('../middlewares/fieldValidator');
const { loginUser, revalidateToken, logoutUser } = require('../controllers/auth');
const { validateJWT } = require('../middlewares/validateJWT');

const router = Router();

router.post( 
    '/',
    [   // Middlewares
        check('email', 'El email es obligatorio').isEmail(),
        check('password', 'El password deber ser de 8 caracteres').isLength({ min: 8 }),
        fieldValidators
    ],  
    loginUser 
);

router.post( '/logout/:id', logoutUser );

router.get( '/renew', validateJWT, revalidateToken );

module.exports = router;