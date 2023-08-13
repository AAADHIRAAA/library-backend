const mongoose = require('mongoose');

const bookSchema = new mongoose.Schema({
    title: String,
    author_name: String,
    editions: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'File'
        }
    ]
}
);
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
