const mongooose = require('mongoose');

const bookSchema = new mongooose.Schema({
    _id:String,
    title: String,
    author_name: String,
    file_id: [{ type: mongoose.Schema.Types.ObjectId, ref: 'File' }]
}
);
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
