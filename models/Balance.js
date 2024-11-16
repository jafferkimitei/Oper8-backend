const mongoose = require('mongoose');

const balanceSchema = new mongoose.Schema({
    load_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Load',
        required: true
    },
    load_amount: {
        type: Number,
        required: true
    },
    dispatcher_earnings: {
        type: Number,
        required: true
    },
    driver_earnings: {
        type: Number,
        required: true
    },
    total_miscellaneous: {
        type: Number,
        required: true
    },
    factoring: {
        type:Number,
        required: true,
    },
    balance: {
        type: Number,
        required: true
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Balance = mongoose.model('Balance', balanceSchema);

module.exports = Balance;
