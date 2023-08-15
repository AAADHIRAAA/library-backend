const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    fileData:Buffer
});

const File = mongoose.model('File',fileSchema);

module.exports = File;