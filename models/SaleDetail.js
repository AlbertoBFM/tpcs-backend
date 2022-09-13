const { Schema, model } = require('mongoose');

const SaleDetailSchema = Schema({

    sale: {
        type: Schema.Types.ObjectId,
        ref: 'Sale',
        required: true
    },
    product: {
        type: Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    quantity: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    },

});

SaleDetailSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports = model( 'SaleDetail', SaleDetailSchema );