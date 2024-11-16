const Load = require('../models/Load');
const bcrypt = require('bcrypt');
const Dispatcher = require('../models/Dispatcher');
const mongoose = require('mongoose');


exports.addDispatcher = async (req, res) => {
  try {
    const { name, email, phone, commission_rate= 0.03, password, role } = req.body;

    if (!name || !email || !phone || !commission_rate || !password || !role) {
      return res.status(400).json({ message: "All fields must be filled out correctly." });
    }
    const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

    const newDispatcher = new Dispatcher({
      name,
      email,
      phone,
      commission_rate,
      password,
      role: 'dispatcher'
    });
    await newDispatcher.save();

    res.status(201).json({ message: "Dispatcher added successfully", dispatcher: newDispatcher });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error submitting dispatcher form. Please try again." });
  }
};


exports.getAllDispatchers = async (req, res) => {
  try {
    const dispatchers = await Dispatcher.find();
    res.status(200).json(dispatchers);
  } catch (error) {
    console.log('Error fetching dispatchers:', error);
    res.status(500).json({ message: 'Error fetching dispatchers' });
  }
};


exports.getDispatcherById = async (req, res) => {
  try {
    // const dispatcher = await Dispatcher.findById(id);
    const dispatcher = await Dispatcher.findById(req.params.id);
    if (!dispatcher) {
      return res.status(404).json({ message: 'Dispatcher not found' });
    }
    const loads = await Load.find({ dispatcher_id: req.params.id });
    let totalCommission = 0;
    const loadData = loads.map(load => {
        const commission = load.rate * dispatcher.commission_rate;
        totalCommission += commission;
        return {
            ...load.toObject(),
            commission
        };
    });

    res.status(200).json({
      dispatcher,
      loads: loadData,
      totalCommission
  });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.updateDispatcher = async (req, res) => {
  // const { id } = req.params;
  //   const updateData = req.body;
  const { name, email, phone, commission_rate } = req.body;

  if (!name || !email || !phone || commission_rate == null) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const dispatcherId = req.params.id;

  // Validate the ID
  if (!mongoose.Types.ObjectId.isValid(dispatcherId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const updatedDispatcher = await Dispatcher.findByIdAndUpdate(
      dispatcherId,
      { name, email, phone, commission_rate },
      { new: true }
    );
    if (!updatedDispatcher) {
      return res.status(404).json({ message: 'Dispatcher not found' });
    }
    res.status(200).json(updatedDispatcher);
  } catch (error) {
    console.log('Error updating dispatcher:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};


exports.deleteDispatcher = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Dispatcher.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: 'Dispatcher not found' });
    res.status(200).json({ message: 'Dispatcher deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};


exports.checkEmailById = async (req, res) => {
  try {
      const email = req.params.email;
      const dispatcher = await Dispatcher.findOne({ email: email });

      if (dispatcher) {
          return res.json({ exists: true });
      } else {
          return res.json({ exists: false });
      }
  } catch (error) {
      console.error("Error checking email:", error);
      return res.status(500).json({ error: "Error checking email" });
  }
};

