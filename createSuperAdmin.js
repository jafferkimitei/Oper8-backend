
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const createSuperAdmin = async () => {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'payroll' });
    const hashedPassword = await bcrypt.hash('$Project1998', 10);
    const superAdmin = new User({
        name: 'Super Admin',
        email: 'jafferkimitei@gmail.com',
        password: hashedPassword,
        role: 'superAdmin'
    });

    try {
        await superAdmin.save();
        console.log('SuperAdmin user created successfully');
    } catch (error) {
        console.error('Error creating SuperAdmin:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

createSuperAdmin();
