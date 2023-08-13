const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    filename: String,
    bookId:String
});

const File = mongoose.model('File',fileSchema);

module.exports = File;