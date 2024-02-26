const express = require('express')
const router = express.Router();


const Expense = require('../models/expense')
const expense = require('../controller/expense')

const authenticate = require('../middleware/auth')


router.get('/' ,authenticate, expense.getAll) //fetch all the expense 

router.post('/add-expense' , authenticate,expense.addExpense) // add a new expense

router.delete('/deleteExpense/:id' , authenticate, expense.deleteExpense) // delete a expense

router.post('/edit-expense/:id' , authenticate,expense.editExpense)

router.post('/get-expense' , authenticate ,expense.getExpenses )


router.get('/download' , authenticate , expense.downloadExpenses)
router.get('/get-all-urls' , authenticate , expense.downloadUrls)


module.exports = router;