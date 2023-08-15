const mongoose = require('mongoose');

const editionSchema = new mongoose.Schema({
    edition_num: { type: Number, default: 0 },
    file: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'File'
    }
});
const Edition = mongoose.model('Edition',editionSchema);

module.exports = Edition;