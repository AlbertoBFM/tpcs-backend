const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const ProviderSchema = Schema({
    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    },
    phone: {
        type: String,
        required: true
    },
    address: {
        type: String,
        required: true
    }
});

ProviderSchema.plugin(mongoosePaginate);

ProviderSchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports = model( 'Provider', ProviderSchema );