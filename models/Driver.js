const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Counter = require('./Counter');


const { Schema } = mongoose;
const driverSchema = new Schema({
    driver_id: {
        type: Number,
        unique: true,
    },
    name: {
        type: String,
        required: true,
    },
    email: {
        type: String,
        required: true,
        unique: true,
    },
    phone: {
        type: String,
        required: true,
    },
    password: {
        type: String,
        required: true,
    },
    role: {
        type: String,
        default: 'driver',
    },
    pay_rate: {
        type: Number,
        required: true,
        min: 0,
    },
    license_number: {
        type: String,
        required: true,
        unique: true,
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { collection: 'driver' });

// Pre-save hook to auto-increment driver_id and hash password
driverSchema.pre('save', async function (next) {
    const driver = this;

    if (driver.isNew) {
        try {
            
            const driverCount = await Driver.countDocuments();

            // If there are no drivers, reset the sequence to 1
            if (driverCount === 0) {
                // Reset the driver_id counter to 1
                await Counter.findOneAndUpdate(
                    { model: 'Driver' },
                    { seq: 1 },
                    { new: true, upsert: true }
                );
            }

            // Auto-increment driver_id
            const counter = await Counter.findOneAndUpdate(
                { model: 'Driver' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            driver.driver_id = counter.seq;

            // Hash the password
            const salt = await bcrypt.genSalt(10);
            driver.password = await bcrypt.hash(driver.password, salt);
        } catch (error) {
            return next(error);
        }
    }
    next();
});

const Driver = mongoose.model('Driver', driverSchema);
module.exports = Driver;

