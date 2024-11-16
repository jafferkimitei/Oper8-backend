const Driver = require('../models/Driver');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const Load = require('../models/Load');

// Add a new driver
exports.addDriver = async (req, res) => {
  try {
    const { name, email, phone, pay_rate, license_number, password, role } = req.body;

    const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

    if (!name || !email || !phone || !pay_rate || !license_number || !password || !role) {
      return res.status(400).json({ message: "All fields must be filled out correctly." });
    }

    const newDriver = new Driver({ 
      name, 
      phone,
      email,
      pay_rate, 
      license_number,
      password: hashedPassword, 
      role: 'driver'
  });
    await newDriver.save();

    res.status(201).json({ message: "Driver added successfully", driver: newDriver });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Error submitting driver form. Please try again." });
  }
};

// Get all drivers
exports.getAllDrivers = async (req, res) => {
  try {
    const drivers = await Driver.find();
    res.status(200).json(drivers);
  } catch (error) {
    console.log('Error fetching drivers:', error);
    res.status(500).json({ message: 'Error fetching drivers' });
  }
};

// Get driver by ID
exports.getDriverById = async (req, res) => {
  try {
    const driver = await Driver.findById(req.params.id);
    if (!driver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    const loads = await Load.find({ driver_id: req.params.id });

    let totalEarnings = 0;
        const loadData = loads.map(load => {
            const earnings = load.rate * (driver.pay_rate / 100);
            totalEarnings += earnings;
            return {
                ...load.toObject(),
                earnings
            };
        });


    res.status(200).json({
            driver,
            loads: loadData,
            totalEarnings
        });
  } catch (error) {
    console.log('Error fetching driver:', error);
    res.status(500).json({ message: 'Error fetching driver' });
  }
};

// Update driver by ID
exports.updateDriver = async (req, res) => {
  const { name, email, phone, pay_rate, license_number } = req.body;

  if (!name || !email || !phone || !pay_rate || !license_number == null) {
    return res.status(400).json({ message: 'All fields are required' });
  }

  const driverId = req.params.id;

  // Validate the ID
  if (!mongoose.Types.ObjectId.isValid(driverId)) {
    return res.status(400).json({ message: 'Invalid ID format' });
  }

  try {
    const updatedDriver = await Driver.findByIdAndUpdate(
      driverId,
      { name, email, phone, pay_rate, license_number },
      { new: true }
    );
    if (!updatedDriver) {
      return res.status(404).json({ message: 'Driver not found' });
    }
    res.status(200).json(updatedDriver);
  } catch (error) {
    console.log('Error updating driver:', error);
    res.status(500).json({ message: 'Internal server error' });
  }
};

// Delete driver by ID
exports.deleteDriver = async (req, res) => {
  const { id } = req.params;

  try {
    const result = await Driver.findByIdAndDelete(id);
    if (!result) return res.status(404).json({ error: 'Driver not found' });
    res.status(200).json({ message: 'Driver deleted successfully' });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};

// Check if the email exists for the given driver by ID
exports.checkEmailById = async (req, res) => {
  try {
      const email = req.params.email;
      const driver = await Driver.findOne({ email: email });

      if (driver) {
          return res.json({ exists: true });
      } else {
          return res.json({ exists: false });
      }
  } catch (error) {
      console.error("Error checking email:", error);
      return res.status(500).json({ error: "Error checking email" });
  }
};

