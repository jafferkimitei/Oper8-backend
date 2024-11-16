const express = require('express');
const router = express.Router();
const { getPayroll } = require('../controllers/payrollController');

router.get('/payroll', getPayroll);
router.get('/payroll/:id', getPayroll);

module.exports = router;
