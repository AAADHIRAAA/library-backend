const mongoose = require('mongoose');

const fileSchema = new mongoose.Schema({
    _id: String,
    name: String
});

const File = mongoose.model('File',fileSchema);

module.export = File;