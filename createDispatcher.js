
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const User = require('./models/User');
require('dotenv').config();

const createDispatcher = async () => {
    await mongoose.connect(process.env.MONGODB_URI, { dbName: 'payroll' });
    const hashedPassword = await bcrypt.hash('$Project2024', 10);
    const Dispatcher = new User({
        name: 'Dispatch',
        email: 'dispatch@sarencoinc.com',
        password: hashedPassword,
        role: 'dispatcher'
    });

    try {
        await Dispatcher.save();
        console.log('Dispatcher user created successfully');
    } catch (error) {
        console.error('Error creating Dispatcher:', error.message);
    } finally {
        mongoose.connection.close();
    }
};

createDispatcher();
