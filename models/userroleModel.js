const mongoose = require('mongoose');
const userroleSchema = new mongoose.Schema({
    role_id: String

});

const UserRole = mongoose.model('UserRole',userroleSchema);

module.exports = UserRole;