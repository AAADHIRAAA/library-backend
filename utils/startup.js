const User = require("../models/userModel");
const startServer = require("../server");
const bcrypt = require('bcrypt');

exports.performStartUp = async function () {   
    try {

        // Check if admin user already exists
       const existingAdmin = await User.findOne({ email: 'admin@library' });

       if (!existingAdmin) {               // Create an admin user
            const admin = new User({
                name: 'admin',
                email: 'admin@library',
                password: 'admin123',
                verified: true,
                role: 'admin'
            });
            const hashedPassword = await bcrypt.hash(admin.password, 10);
            admin.password = hashedPassword;
          
            await admin.save();
        }

    } catch (e) {
        if (e.code === "ER_DUP_ENTRY") {
        } else {
            console.error(e.message);
        }
    }

    console.log('Startup tasks completed');
    startServer();
}
