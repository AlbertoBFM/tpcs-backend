const { response } = require('express');
const Category = require('../models/Category');

const getAllCategories = async ( req, res = response ) => {
    try {
        const categories = await Category.find().select('name');
        return res.status( 200 ).json({
            ok: true,
            categories
        });
    } catch (error) {
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });
    }
}

const getCategories = async ( req, res = response ) => {
    try {
        const { limit = 5, page = 1, name = "" } = req.query; 
        const searchedName = name.toUpperCase().trim();
        const categories = await Category.paginate({ name: { $regex: '.*' + searchedName + '.*' } }, { limit, page });
        return res.status( 200 ).json({
            ok: true,
            categories
        });
    } catch (error) {
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });
    }
}

const createCategory = async ( req, res = response ) => {

    const { name } = req.body;

    try {

        const category = await Category.findOne({ name: name.toUpperCase().trim() });

        if ( category )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Una categoría existe con ese nombre'
            });
        
        req.body.name = req.body.name.toUpperCase().trim(); 
        const newCategory = new Category( req.body );
        
        const savedCategory = await newCategory.save();

        return res.status( 201 ).json({
            ok: true,
            category: savedCategory
        });

    } catch (error) {
        
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });

    }

}

const updateCategory = async ( req, res = response ) => {

    const categoryId = req.params.id;
    const { name } = req.body;

    try {
        
        const category = await Category.findById( categoryId ); //* buscar si categoría existe
        
        if ( !category )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de categoría no existe'
            });

        const categoryByName = await Category.findOne({ name: name.toUpperCase().trim(), _id: { $ne: categoryId } }); //* Busca si existe una categoría con el mismo nombre, exceptuando la categoría que se actualizará 
        
        if ( categoryByName )
            return res.status( 400 ).json({
                ok: false,
                msg: 'Una categoría existe con ese nombre'
            });

            
        req.body.name = req.body.name.toUpperCase().trim(); 
        const updatedCategory = await Category.findByIdAndUpdate( categoryId, req.body, { new: true } ); //* "new: true" es para que devuelva la categoría actualizada

        return res.status( 200 ).json({
            ok: true,
            updatedCategory
        });

    } catch (error) {
        
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });

    }

}

const deleteCategory = async ( req, res = response ) => {

    const categoryId = req.params.id;

    try {
        
        const category = await Category.findById( categoryId ); //* buscar si categoría existe
        
        if ( !category )
            return res.status( 400 ).json({
                ok: false,
                msg: 'El Id de categoría no existe'
            });

        const deletedCategory = await Category.findByIdAndDelete( categoryId );

        return res.status( 200 ).json({
            ok: true,
            deletedCategory
        });

    } catch (error) {
        
        console.log( error );
        return res.status( 500 ).json({
            ok: false,
            msg: 'Hable con el Administrador'
        });

    }

}

module.exports = {
    getAllCategories,
    getCategories,
    createCategory,
    updateCategory,
    deleteCategory
}