const mongoose = require('mongoose');
const Edition = require('./editionModel');
const bookSchema = new mongoose.Schema({
    title: String,
    author_name: String,
    editions: [String]
});

const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
