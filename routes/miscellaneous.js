
const express = require('express');
const router = express.Router();
const expenseController = require('../controllers/expenseController')
const upload = require('../middlewares/uploadMiddleware');


router.get('/', expenseController.getAllExpenses);
router.get('/:load_id', expenseController.getExpensesByLoadId);
router.post('/add', upload.array('images', 5), expenseController.addExpense);
router.delete('/:id', expenseController.deleteExpense);

module.exports = router;
