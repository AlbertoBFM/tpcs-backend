const { Schema, model } = require('mongoose');

const ProductSchema = Schema({

    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    stock: {
        type: Number,
        required: true
    },
    purchasePrice: {
        type: Number,
        required: true
    },
    salePrice: {
        type: Number,
        required: true
    },
    category: {
        type: Schema.Types.ObjectId,
        ref: 'Category',
        required: true
    },
    provider: {
        type: Schema.Types.ObjectId,
        ref: 'Provider',
        required: true
    }

});

ProductSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports = model( 'Product', ProductSchema );