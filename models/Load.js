const mongoose = require('mongoose');
const Counter = require('./Counter');

const { Schema } = mongoose;

const loadSchema = new Schema({
    load_id: {
        type: Number,
        unique: true, 
    },
    from_location: {
        type: String,
        required: true,
    },
    to_location: {
        type: String,
        required: true,
    },
    pickup_date: {
        type: String,
        required: true,
    },
    rate_per_mile: {
        type: Number,
        required: true,
        min: 0,
    },
    miles: {
        type: Number,
        required: true,
        min: 0,
    },
    rate: {
        type: Number,
        required: true,
        min: 0, 
    },
    broker: {
        type: String,
        required: true,
    },
    driverId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Driver' 
    },
    dispatcherId: { 
        type: Schema.Types.ObjectId, 
        ref: 'Dispatcher' 
    },
    dispatcherEarnings: {
    type: Number,
    required: true,
},
driverEarnings: {
    type: Number,
    required: true,
},
    createdAt: {
        type: Date,
        default: Date.now,
    },
    images: [String] 
}, { collection: 'load' });
// strictPopulate: false
loadSchema.pre('save', async function (next) {
    const load = this;

    if (load.isNew) {
        try {

            if (load.rate_per_mile && load.miles) {
                load.rate = load.rate_per_mile * load.miles;
            }
            const counter = await Counter.findOneAndUpdate(
                { model: 'Load' },
                { $inc: { seq: 1 } },
                { new: true, upsert: true }
            );
            load.load_id = counter.seq;
            next();
        } catch (error) {
            console.error('Error in pre-save hook for Load:', error);
            next(error);
        }
    } else {
        next();
    }
});

const Load = mongoose.model('Load', loadSchema);
module.exports = Load;