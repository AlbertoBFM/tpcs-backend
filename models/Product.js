const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

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

ProductSchema.plugin(mongoosePaginate);

ProductSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports = model( 'Product', ProductSchema );