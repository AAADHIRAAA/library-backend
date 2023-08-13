const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author_name: String,
    file_id: String
}
);
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
