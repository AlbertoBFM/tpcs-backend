const { Schema, model } = require('mongoose');

const SaleSchema = Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    // client: {
    //     type: Schema.Types.ObjectId,
    //     ref: 'Client',
    //     required: true
    // },
    date: {
        type: Date,
        required: true
    },
    total: {
        type: Number,
        required: true
    },

});

SaleSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports = model( 'Sale', SaleSchema );