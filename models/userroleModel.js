const mongoose = require('mongoose');

const roleSchema = new mongoose.Schema({
    _id: String,
    name: String
});

const Role = mongoose.model('Role',roleSchema);

const userroleSchema = new mongoose.Schema({
    user_id:[{type: mongoose.Schema.Types.ObjectId, ref:'User'}],
    role_id:[{type: mongoose.Schema.Types.ObjectId, ref: 'Role'}]

});

const UserRole = mongoose.model('UserRole',userroleSchema);

module.export = {
    Role,
    UserRole
};