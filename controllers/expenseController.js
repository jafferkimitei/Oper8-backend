const Miscellaneous = require('../models/Miscellaneous');

const getAllExpenses = async (req, res) => {
    try {
        const allDeductions = await Miscellaneous.find({});
        res.status(200).json(allDeductions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const getExpensesByLoadId = async (req, res) => {
    try {
        const deductions = await Miscellaneous.find({ load_id: req.params.load_id });
        if (!deductions || deductions.length === 0) {
            return res.status(404).json({ message: 'No deductions found for this load.' });
        }
        res.status(200).json(deductions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const addExpense = async (req, res) => {
    console.log(req.body);
    console.log(req.files);

    const { load_id, from_location, to_location, type, description, amount } = req.body;
    const imagePaths = req.files ? req.files.map(file => file.path) : [];

    try {
        const newDeduction = new Miscellaneous({
            load_id,
            from_location,
            to_location,
            type,
            description,
            amount,
            images: imagePaths
        });
        await newDeduction.save();
        res.status(201).json(newDeduction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
};

const deleteExpense = async (req, res) => {
    console.log(`Attempting to delete ID: ${req.params.id}`);
    try {
        const deduction = await Miscellaneous.findByIdAndDelete(req.params.id);
        if (!deduction) {
            console.log('Deduction not found');
            return res.status(404).json({ message: 'Deduction not found.' });
        }
        console.log('Deduction deleted successfully');
        res.status(200).json({ message: 'Deduction deleted successfully.' });
    } catch (error) {
        console.error('Error deleting deduction:', error);
        res.status(500).json({ error: error.message });
    }
};

module.exports = {
    getAllExpenses,
    getExpensesByLoadId,
    addExpense,
    deleteExpense
};
