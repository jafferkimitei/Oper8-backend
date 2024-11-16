const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Counter = require('./Counter');

const { Schema } = mongoose;

const dispatcherSchema = new Schema({
    dispatcher_id: {
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
        default: 'dispatcher',
    },
    commission_rate: {
        type: Number,
        required: true,
        default: 0.03
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
}, { collection: 'dispatcher' });


dispatcherSchema.pre('save', async function (next) {
    const dispatcher = this;

    if (dispatcher.isNew) {
        try {
            
            const dispatcherCount = await Dispatcher.countDocuments();

           
            if (dispatcherCount === 0) {
                
                await Counter.findOneAndUpdate(
                    { model: 'Dispatcher' },
                    { seq: 1 },
                    { new: true, upsert: true }
                );
            }

            
            const counter = await Counter.findOneAndUpdate(
                { model: 'Dispatcher' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            dispatcher.dispatcher_id = counter.seq;

           
            const salt = await bcrypt.genSalt(10);
            dispatcher.password = await bcrypt.hash(dispatcher.password, salt);
        } catch (error) {
            return next(error);
        }
    }
    next();
});


const Dispatcher = mongoose.model('Dispatcher', dispatcherSchema);
module.exports = Dispatcher;
