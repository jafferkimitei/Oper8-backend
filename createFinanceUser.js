const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const createFinanceUser = async () => {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'payroll' });
    const hashedPassword = await bcrypt.hash('$Project2024', 10);
    const financeUser = new User({
        name: 'Finance',
        email: 'accounting@sarencoinc.com',
        password: hashedPassword,
        role: 'finance'
    });

    try {
        await financeUser.save();
        console.log('Finance user created successfully');
    } catch (error) {
        console.error('Error creating Finance user:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

createFinanceUser();
