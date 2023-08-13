const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    _id: String,
    role_name: String
});

const Role = mongoose.model('Role',roleSchema);

const userroleSchema = new mongoose.Schema({
    user_id:String,
    role_id: String

});

const UserRole = mongoose.model('UserRole',userroleSchema);

module.exports = {
    Role,
    UserRole
};