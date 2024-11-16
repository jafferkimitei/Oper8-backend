const express = require('express');
const router = express.Router();
const Driver = require('../models/Driver');
const Load = require('../models/Load');
const bcrypt = require('bcrypt');
const driverController = require('../controllers/driverController');



router.post('/add', driverController.addDriver);

router.get('/', driverController.getAllDrivers);



router.get('/:id', driverController.getDriverById);



router.put('/:id', driverController.updateDriver);

router.delete('/:id', driverController.deleteDriver);

router.get('/email-exists/:email', driverController.checkEmailById);


module.exports = router;
