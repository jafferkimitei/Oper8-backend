const Driver = require('../models/Driver'); // Assuming Mongoose models
const Dispatcher = require('../models/Dispatcher');
const Load = require('../models/Load');
const Balance = require('../models/Balance');
const Miscellaneous = require('../models/Miscellaneous');

const getStats = async (req, res) => {
  try {
    // Get total drivers, dispatchers, and loads
    const totalDrivers = await Driver.countDocuments();
    const totalDispatchers = await Dispatcher.countDocuments();
    const totalLoads = await Load.countDocuments();

    // Get total expenses
    const totalExpenses = await Miscellaneous.aggregate([
      { $group: { _id: null, total: { $sum: '$amount' } } }
    ]);

    // Fetch all loads to calculate the revenue and sum up relevant data
    const loads = await Load.find();

    // Sum up total load rate, dispatcher earnings, and driver earnings
    let totalLoadRate = 0;
    let totalDispatcherEarnings = 0;
    let totalDriverEarnings = 0;

    loads.forEach(load => {
      totalLoadRate += load.rate; // Sum of all load rates
      totalDispatcherEarnings += load.dispatcherEarnings; // Sum of all dispatcher earnings
      totalDriverEarnings += load.driverEarnings; // Sum of all driver earnings
    });

    // Calculate 3% of total load rate
    const threePercentOfTotalLoadRate = 0.03 * totalLoadRate;

    // Calculate the revenue
    const revenue = totalLoadRate - (totalDispatcherEarnings + totalDriverEarnings + threePercentOfTotalLoadRate);

    res.json({
      totalDrivers,
      totalDispatchers,
      totalLoads,
      totalExpenses: totalExpenses[0]?.total || 0,
      revenue, // Use the calculated revenue here
      dispatcherEarnings: totalDispatcherEarnings,
      driverEarnings: totalDriverEarnings,
    });

  } catch (error) {
    console.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch statistics' });
  }
};

module.exports = {
  getStats,
};
