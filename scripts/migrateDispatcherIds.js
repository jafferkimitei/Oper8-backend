const mongoose = require('mongoose');
const Dispatcher = require('../models/Dispatcher');
const { ObjectId } = require('mongodb');

mongoose.connect('mongodb://localhost:27017/payroll')
    .then(() => {
        console.log('Database connected');
        return migrateDispatcherIds();
    })
    .then(() => {
        console.log('Migration completed');
        mongoose.disconnect();
    })
    .catch((error) => {
        console.error('Error during migration:', error);
        mongoose.disconnect();
    });


async function migrateDispatcherIds() {
    const dispatchers = await Dispatcher.find({});
    
    for (let dispatcher of dispatchers) {
        if (typeof dispatcher.dispatcher_id === 'number') {
            dispatcher.dispatcher_id = new ObjectId().toString();
            await dispatcher.save();
        }
    }
}
