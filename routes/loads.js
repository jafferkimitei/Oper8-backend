const express = require('express');
const router = express.Router();
const User = require('../models/User');
const loadController = require('../controllers/loadController');


router.post('/add', loadController.addLoad);
router.get('/', loadController.getLoads);
router.delete('/:id', loadController.deleteLoad);
router.put('/:id', loadController.updateLoad);


module.exports = router;
