const express = require('express');
const router = express.Router();
const Dispatcher = require('../models/Dispatcher');
const Load = require('../models/Load');
const bcrypt = require('bcrypt');
const dispatcherController = require('../controllers/dispatcherController');



router.post('/add', dispatcherController.addDispatcher);


router.get('/', dispatcherController.getAllDispatchers);


router.get('/:id', dispatcherController.getDispatcherById);


router.put('/:id', dispatcherController.updateDispatcher);

router.delete('/:id', dispatcherController.deleteDispatcher);

router.get('/email-exists/:email', dispatcherController.checkEmailById);




module.exports = router;
