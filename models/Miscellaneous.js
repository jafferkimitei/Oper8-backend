const mongoose = require('mongoose');

const miscellaneousSchema = new mongoose.Schema({
    load_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Load', required: true },
    from_location: { type: String, required: true }, 
    to_location: { type: String, required: true },    
    type: { type: String, required: true }, 
    description: { type: String, required: true },
    amount: { type: Number, required: true },
    date: { type: Date, default: Date.now },
    images: [String] 
}, { collection: 'miscellaneous' });

module.exports = mongoose.model('Miscellaneous', miscellaneousSchema);
