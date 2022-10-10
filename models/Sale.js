const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const SaleSchema = Schema({

    user: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    client: {
        type: String
    },
    date: {
        type: Date,
        required: true
    },
    total: {
        type: Number,
        required: true
    },

});

SaleSchema.plugin(mongoosePaginate);

SaleSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports = model( 'Sale', SaleSchema );