const Load = require('../models/Load');
const Dispatcher = require('../models/Dispatcher');
const Driver = require('../models/Driver');
const mongoose = require('mongoose');
const moment = require('moment');

const getPayroll = async (req, res) => {
    const { driverId, dispatcherId, startDate, endDate } = req.query;

    try {
        if (!driverId && !dispatcherId) {
            return res.status(400).json({ message: 'Please provide either a driverId or a dispatcherId.' });
        }


        // Fetch the driver if driverId is provided
        if (driverId) {
            console.log(`Fetching driver with ID: ${driverId}`);
            const driver = await Driver.findById(driverId);
            if (!driver) {
                console.log('Driver not found');
                return res.status(404).json({ message: 'Driver not found' });
            }
            console.log('Driver fetched:', driver);
        }

        // Fetch the dispatcher if dispatcherId is provided
        if (dispatcherId) {
            console.log(`Fetching dispatcher with ID: ${dispatcherId}`);
            const dispatcher = await Dispatcher.findById(dispatcherId);
            if (!dispatcher) {
                console.log('Dispatcher not found');
                return res.status(404).json({ message: 'Dispatcher not found' });
            }
            console.log('Dispatcher fetched:', dispatcher);
        }

        const start = moment(startDate).startOf('day').toDate();
        const end = moment(endDate).endOf('day').toDate();
        const query = {
            ...(driverId && { driverId }),
            ...(dispatcherId && { dispatcherId }),
            createdAt: { $gte: start, $lte: end }
          };

        // Fetch all loads and populate the driverId
        console.log('Fetching all loads...');
        const loads = await Load.find(query)
            .populate('driverId')  // Populate the driverId with the driver document
            .populate('dispatcherId'); // Populate dispatcherId with the dispatcher document
        console.log('All loads fetched:', loads);

        // Filter the loads based on driverId or dispatcherId
        let filteredLoads = loads;

        if (driverId) {
            console.log('Filtering loads by driverId');
            filteredLoads = loads.filter(load => {
                if (load.driverId && load.driverId._id.toString() === driverId) {
                    return true;
                }
                return false;
            });
            console.log('Filtered loads by driverId:', filteredLoads);
        }

        if (dispatcherId) {
            console.log('Filtering loads by dispatcherId');
            filteredLoads = loads.filter(load => {
                if (load.dispatcherId && load.dispatcherId._id.toString() === dispatcherId) {
                    return true;
                }
                return false;
            });
            console.log('Filtered loads by dispatcherId:', filteredLoads);
        }

        if (filteredLoads.length === 0) {
            console.log('No loads found for the provided ID.');
            return res.status(404).json({ message: 'No loads found for the provided ID.' });
        }

        // Calculate total earnings for the filtered loads
        console.log('Calculating total earnings...');
        const totalEarnings = filteredLoads.reduce((acc, load) => {
            if (driverId) {
                console.log(`Adding driver earnings: ${load.driverEarnings}`);
                return acc + load.driverEarnings;
            } else if (dispatcherId) {
                console.log(`Adding dispatcher earnings: ${load.dispatcherEarnings}`);
                return acc + load.dispatcherEarnings;
            }
            return acc;
        }, 0);

        console.log('Total earnings calculated:', totalEarnings);

        res.status(200).json({
            loads: filteredLoads,
            totalEarnings: parseFloat(totalEarnings.toFixed(2)),
            title: driverId ? `Payroll for ${filteredLoads[0].driverId.name}` : `Payroll for ${filteredLoads[0].dispatcherId.name}`
        });

    } catch (error) {
        console.error('Error occurred:', error); // Log error for debugging
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getPayroll,
};


module.exports = {
    getPayroll,
};
