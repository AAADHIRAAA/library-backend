const mongoose = require('mongoose');
const Edition = require('./editionModel');
const bookSchema = new mongoose.Schema({
    title: String,
    author_name: String,
    editions: [Edition.schema]
});

// const bookSchema = new mongoose.Schema({
//     title: String,
//     author_name: String,
//     editions: [
//         {
            
//             edition_num: { type: Number, default: 0 },
//             file:{
//             type: mongoose.Schema.Types.ObjectId,
//             ref: 'File'
//             },
//         }
//     ]
// }
// );
const Book = mongoose.model('Book', bookSchema);

module.exports = Book;
