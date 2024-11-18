const Load = require('../models/Load');
const Dispatcher = require('../models/Dispatcher');
const Driver = require('../models/Driver');
const validateLoadData = (data) => {
  const { from_location, to_location, pickup_date, rate_per_mile, miles, driverId, dispatcherId } = data;
  let errors = {};

  if (!from_location) errors.fromLocation = 'From location is required';
  if (!to_location) errors.toLocation = 'To location is required';
  if (!pickup_date) errors.pickup_date = 'Pick up date is required';
  if (!rate_per_mile || rate_per_mile <= 0) errors.ratePerMile = 'Rate per mile must be greater than 0';
  if (!miles || miles <= 0) errors.miles = 'Miles must be greater than 0';
  if (!driverId) errors.driverId = 'Driver ID is required';
  if (!dispatcherId) errors.dispatcherId = 'Dispatcher ID is required';

  return {
    isValid: Object.keys(errors).length === 0,
    errors,
  };
};

const addLoad = async (req, res) => {
  console.log(req.files);
  try {
    const { from_location, to_location, pickup_date, rate_per_mile, miles, broker, driverId, dispatcherId } = req.body;

    // Validation
    const { isValid, errors } = validateLoadData(req.body);
    if (!isValid) return res.status(400).json({ message: 'Validation error', errors });

    
    const driver = await Driver.findById(driverId);
    const dispatcher = await Dispatcher.findById(dispatcherId);
   
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    if (!dispatcher) return res.status(404).json({ message: 'Dispatcher not found' });
    if (!broker) {
      return res.status(400).json({ message: 'Broker is required' });
    }

    const rate = rate_per_mile * miles;
    const dispatcherEarnings = rate * (dispatcher.commission_rate);
    const driverEarnings = rate * (driver.pay_rate / 100);
    

    const newLoad = new Load({
      from_location,
      to_location,
      pickup_date,
      rate_per_mile,
      miles,
      rate,
      broker,
      driverId,
      dispatcherId,
      dispatcherEarnings,
      driverEarnings,
      createdAt: new Date(),
    });

    await newLoad.save();
    res.status(201).json(newLoad);
  } catch (error) {
    res.status(500).json({ message: 'Error adding load', error: error.message || error });
  }
};

const getLoads = async (req, res) => {
  try {

    const loads = await Load.find({})
      .populate('dispatcherId', 'name email') 
      .populate('driverId', 'name phone pay_rate'); 

    const loadsWithEarnings = loads.map(load => {

      return {
        ...load.toObject(),
        dispatcherEarnings: load.dispatcherEarnings,
        driverEarnings: load.driverEarnings,
      };
    });
    console.log(loads);
    res.status(200).json(loadsWithEarnings);
    console.log(loadsWithEarnings);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

const deleteLoad = async (req, res) => {
  const { id } = req.params;
  
    try {
        const result = await Load.findByIdAndDelete(id);
        if (!result) return res.status(404).json({ error: 'Load not found' });
        res.status(200).json({ message: 'Load deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const updateLoad = async (req, res) => {
  const { id } = req.params;
  const { from_location, to_location, pickup_date, rate, driverId, dispatcherId } = req.body;

  try {
    
    const { isValid, errors } = validateLoadData(req.body);
    if (!isValid) return res.status(400).json({ message: 'Validation error', errors });

    
    const load = await Load.findById(id);
    if (!load) return res.status(404).json({ message: 'Load not found' });

    
    const driver = await Driver.findById(driverId);
    const dispatcher = await Dispatcher.findById(dispatcherId);
    if (!driver) return res.status(404).json({ message: 'Driver not found' });
    if (!dispatcher) return res.status(404).json({ message: 'Dispatcher not found' });

    
    const dispatcherEarnings = rate * dispatcher.commission_rate;
    const driverEarnings = rate * (driver.pay_rate / 100);


   
    load.from_location = from_location || load.from_location;
    load.to_location = to_location || load.to_location;
    load.pickup_date = pickup_date || load.pickup_date;
    load.rate = rate || load.rate;
    load.driverId = driverId || load.driverId;
    load.dispatcherId = dispatcherId || load.dispatcherId;
    load.dispatcherEarnings = dispatcherEarnings;
    load.driverEarnings = driverEarnings;
    load.updatedAt = new Date();

   
    await load.save();

   
    res.status(200).json(load);
  } catch (error) {
    res.status(500).json({ message: 'Error updating load', error: error.message || error });
  }
};


module.exports = {
  addLoad,
  getLoads,
  deleteLoad,
  updateLoad,
};