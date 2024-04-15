const Expense = require('../models/expense')
const mongoose=require("mongoose")
const mongoDb = require('../util/db')
const Download = require('../models/download');


const S3Services = require('../services/s3services')

exports.getAll = async (req, res) => {
try {
    const userId = req.user._id;

    // Find expenses of the user
    const expenses = await Expense.find({  user_id: userId })
        .select("id expense category description")
        .lean();

    return res.json({ data: expenses });
} catch (e) {
    console.error(e);
    return res.status(500).json({ msg: "Internal server error" });
}
};


exports.addExpense = async (req, res) => {
    try {
        const { expense, description, category } = req.body;

        // Create a new expense
        const newExpense = await Expense.create({
            user_id: req.user._id,
            expense,
            description,
            category
        });

        // Update total amount for the user
        const newAmount = Number(req.user.totalAmount) + Number(expense);
        await req.user.updateOne({ totalAmount: newAmount });

        return res.json({ data: newExpense });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};

exports.deleteExpense = async (req, res) => {
    try {
        const id = req.params.id;

        // Find the expense by ID and user
        const expense = await Expense.findOneAndDelete({ _id: id, user_id: req.user._id });

        // Update totalAmount for the user
        req.user.totalAmount -= Number(expense.expense);
        await req.user.save();

        return res.status(200).json({ success: true, msg: "Deleted successfully" });
    } catch (error) {
        console.error(error);
        return res.status(401).json({ success: false, msg: "Unauthorized or Expense not found" });
    }
};
exports.editExpense = async (req, res) => {
    try {
        const id = req.params.id;

        // Find the expense by ID and user
        console.log("AM printing")
       console.log(id,req.user._id)
        const expense = await Expense.findOne({ _id: id, user_id: req.user._id });

        // If expense not found, return 404
        if (!expense) {
            return res.status(404).json({ success: false, msg: "Expense not found" });
        }

        // Update expense fields
        expense.expense = req.body.expense;
        expense.description = req.body.description;
        expense.category = req.body.category;

        // Save the updated expense
        await expense.save();

        return res.json({ success: true });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};

exports.getExpenses = async (req, res) => {
    try {
        const page = +req.query.page || 1;
        const items = +req.query.items || 5;

        // Find expenses for the user with pagination
        const expenses = await Expense.find({ user_id: req.user._id })
            .skip((page - 1) * items)
            .limit(items);

        // Count total expenses for the user
        const totalExpenses = await Expense.countDocuments({ user_id: req.user._id });

        return res.json({ expenses, totalExpenses });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};

exports.downloadExpenses = async (req, res) => {
    try {
      const expenses = await Expense.find({ user_id: req.user._id });
      const expensesToString = JSON.stringify(expenses);
      const fileName = `expense_${req.user._id}_${Date.now()}.txt`;
      
      // Assuming S3Services is a service for uploading to AWS S3
      const fileUrl = await S3Services.uploadToS3(expensesToString, fileName);
      
      // Create a new download record
      await Download.create({ user_id: req.user._id, url: fileUrl.Location });
  
      return res.json({ fileUrl: fileUrl.Location, success: true });
    } catch (error) {
      console.error("Error in downloadExpenses:", error);
      return res.status(500).json({ success: false, msg: "Internal server error" });
    }
  };
exports.downloadUrls = async (req, res) => {
    try {
        // Find all download URLs associated with the user
        const downloads = await Download.find({ user_id: req.user._id });

        return res.json({ success: true, urls: downloads });
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
};