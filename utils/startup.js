const Role = require("../models/userroleModel");
const UserRole = require("../models/userroleModel");
const User = require("../models/userModel");


exports.performStartUp = async function () {
// Create the user
    try {

        const adminRole = new Role({
            role_name: "admin"
        });
        await adminRole.save();

        const userRole = new Role({
            role_name: "user"
        });
        await userRole.save();


    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") {

        } else {
            console.error(e.message);
        }
    }
    try {
        
        // Find the "admin" role from the Role collection
        const adminRole = await Role.findOne({ role_name: 'admin' });

        if (!adminRole) {
            // Handle if admin role doesn't exist
            return res.status(404).json({ message: 'Admin role not found' });
        }

        // Create an admin user
        const admin = new User({
        name: 'admin',
        email: 'admin@library',
        password: 'admin123'
        });

        await admin.save();

        // Create a user role entry for the admin user
        const adminUserRole = new UserRole({
            user_id: admin._id,
            role_id: adminRole._id
        });

        await adminUserRole.save();

    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") {
        } else {
            console.error(e.message);
        }
    }


    console.log('Startup tasks completed');
}
