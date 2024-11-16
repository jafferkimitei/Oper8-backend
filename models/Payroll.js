const mongoose = require('mongoose');

const payrollSchema = new mongoose.Schema({
    load_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Load',
        required: true,
    },
    driverId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Driver',
        required: true,
    },
    dispatcherId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Dispatcher',
        required: true,
    },
    amount: {
        type: Number,
        required: true,
        min: 0,
    },
    payroll_date: {
        type: Date,
        default: Date.now,
    },
}, { collection: 'payroll' });

const Payroll = mongoose.model('Payroll', payrollSchema);

module.exports = Payroll;
