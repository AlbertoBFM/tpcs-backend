const { Schema, model } = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const CategorySchema = Schema({

    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    }

});

CategorySchema.plugin(mongoosePaginate);

CategorySchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports = model( 'Category', CategorySchema );