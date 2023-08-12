const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    _id:String,
    title: String,
    author_name: String,
    file_id: String
}
);
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
