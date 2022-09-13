const { Schema, model } = require('mongoose');

const CategorySchema = Schema({

    name: {
        type: String,
        required: true
    },
    description: {
        type: String
    }

});

CategorySchema.method('toJSON', function () {
    const { __v, ...object } = this.toObject();
    return object;
});

module.exports = model( 'Category', CategorySchema );