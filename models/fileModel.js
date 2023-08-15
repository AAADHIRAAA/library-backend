const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: String,
    edition_num: { type: Number, default: 0 },
    bookId:{
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book'
    },
    mimeType:String,
    fileData:Buffer
});

const File = mongoose.model('File',fileSchema);

module.exports = File;