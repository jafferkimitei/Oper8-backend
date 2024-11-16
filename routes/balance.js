const express = require('express');
const router = express.Router();
const Load = require('../models/Load');
const Miscellaneous = require('../models/Miscellaneous');
const Balance = require('../models/Balance');


router.get('/loads', async (req, res) => {
  const { loadId, startDate, endDate } = req.query;

  try {
    
    let filter = {};

    
    if (loadId) {
      filter._id = loadId; 
    }

    
    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      filter.pickup_date = { $gte: start, $lte: end };
    }

    const loads = await Load.find(filter)
      .populate('driverId', 'pay_rate')
      .populate('dispatcherId');

    
    let totalLoadAmount = 0;
    let totalDispatcherEarnings = 0;
    let totalDriverEarnings = 0;
    let totalMiscellaneous = 0;
    let totalFactoring = 0;
    let finalBalance = 0;

    
    for (let load of loads) {
     
      const dispatcherEarnings = load.rate * 0.03; 
      const driverEarnings = load.rate * (load.driverId.pay_rate / 100);

   
      const miscellaneousDeductions = await Miscellaneous.find({ load_id: load._id });
      const totalMisc = miscellaneousDeductions.reduce((sum, deduction) => sum + deduction.amount, 0);

      const factoring = load.rate * 0.03;
      
      const loadAmount = load.rate || 0;
      const balance = loadAmount - (dispatcherEarnings + driverEarnings + totalMisc + factoring);

      
      totalLoadAmount += loadAmount;
      totalDispatcherEarnings += dispatcherEarnings;
      totalDriverEarnings += driverEarnings;
      totalMiscellaneous += totalMisc;
      totalFactoring += factoring;
      finalBalance += balance;

      const newBalance = new Balance({
        load_id: load._id,
        load_amount: loadAmount,
        dispatcher_earnings: dispatcherEarnings,
        driver_earnings: driverEarnings,
        total_miscellaneous: totalMisc,
        factoring: factoring,
        balance: balance
      });

      await newBalance.save();
    }

   
    res.status(200).json({
      totals: {
        totalLoadAmount,
        totalDispatcherEarnings,
        totalDriverEarnings,
        totalMiscellaneous,
        totalFactoring,
        finalBalance
      },
      loads: loads 
    });
  } catch (error) {
    console.log('Error fetching loads and calculating totals:', error);
    res.status(500).json({ error: 'Error fetching loads and calculating totals' });
  }
});


router.get('/:load_id', async (req, res) => {
  try {
    
    const load = await Load.findById(req.params.load_id)
      .populate('driverId', 'pay_rate')
      .populate('dispatcherId');
    if (!load) return res.status(404).json({ error: 'Load not found' });

    const dispatcherEarnings = load.rate * 0.03;
    const driverEarnings = load.rate * (load.driverId.pay_rate / 100);

    const miscellaneousDeductions = await Miscellaneous.find({ load_id: req.params.load_id });
    const totalMiscellaneous = miscellaneousDeductions.reduce((total, deduction) => total + deduction.amount, 0);

    const factoring = load.rate * 0.03;

    const loadAmount = load.rate || 0;
    const balance = loadAmount - (dispatcherEarnings + driverEarnings + totalMiscellaneous + factoring );

    const newBalance = new Balance({
      load_id: load._id,
      load_amount: loadAmount,
      dispatcher_earnings: dispatcherEarnings,
      driver_earnings: driverEarnings,
      total_miscellaneous: totalMiscellaneous,
      factoring: factoring,
      balance: balance
    });

    await newBalance.save();

    res.status(200).json({
      loadAmount,
      dispatcherEarnings,
      driverEarnings,
      totalMiscellaneous,
      factoring,
      balance
    });
  } catch (error) {
    console.log('Error fetching balance:', error);
    res.status(500).json({ error: error.message });
  }
});

module.exports = router;
