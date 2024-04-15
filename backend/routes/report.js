const express = require('express')

const router = express.Router()

const auth = require('../middleware/auth')
const Expense = require('../models/expense')
//const { Op, literal ,fn} = require('sequelize')


// router.post('/getdate', auth, async (req, res) => {
//     try {
//         if (req.user.isPremiumUser) {

//             const data = await req.user.getExpenses({ where: { createdAt: req.body.date } })
//             return res.json(data)
//         } else {

//             return res.status(403).json({ success: false, msg: "you are not a premium user" })
//         }
//     } catch (e) {
//         console.log(e)
//         return res.status(500).json({ success: false, msg: "Internal server error" })
//     }
// })
router.post('/getdate', auth, async (req, res) => {
    try {
        if (req.user.isPremiumUser) {
            // Convert the provided date string to a Date object
            const date = new Date(req.body.date);

            // Find expenses for the user based on the provided date
            const data = await Expense.find({ user_id: req.user._id, createdAt: date });

            return res.json(data);
        } else {
            return res.status(403).json({ success: false, msg: "You are not a premium user" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
});

router.get('/getweekly', auth, async (req, res) => {
    try {
        if (req.user.isPremiumUser) {
            const currDate = new Date();
            currDate.setDate(currDate.getDate() - 7);

            // Aggregate expenses to calculate total amount for each day of the week
            const result = await Expense.aggregate([
                {
                    $match: {
                        user_id: req.user._id,
                        createdAt: { $gt: currDate }
                    }
                },
                {
                    $group: {
                        _id: { $dayOfWeek: "$createdAt" },
                        totalAmount: { $sum: "$expense" }
                    }
                }
            ]);

            return res.json(result);
        } else {
            return res.status(403).json({ success: false, msg: "You are not a premium user" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
});
router.post('/getMonthly', auth, async (req, res) => {
    try {
        if (req.user.isPremiumUser) {
            const month = req.body.month;
            const startDate = new Date(month);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
            
            // Aggregate expenses to calculate total amount for each day of the month
            const result = await Expense.aggregate([
                {
                    $match: {
                        user_id: req.user._id,
                        createdAt: { $gte: startDate, $lt: endDate }
                    }
                },
                {
                    $group: {
                        _id: { $dateToString: { format: "%Y-%m-%d", date: "$createdAt" } },
                        totalAmount: { $sum: "$expense" }
                    }
                }
            ]);

            return res.json(result);
        } else {
            return res.status(403).json({ success: false, msg: "You are not a premium user" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
});

router.post('/getYearly', auth, async (req, res) => {
    try {
        if (req.user.isPremiumUser) {
            const year = req.body.year;
            const startYear = new Date(year);
            const endYear = new Date(startYear.getFullYear() + 1, 0, 1);
            
            // Aggregate expenses to calculate total amount for each month of the year
            const result = await Expense.aggregate([
                {
                    $match: {
                        user_id: req.user._id,
                        createdAt: { $gte: startYear, $lt: endYear }
                    }
                },
                {
                    $group: {
                        _id: { $month: "$createdAt" },
                        totalAmount: { $sum: "$expense" }
                    }
                }
            ]);

            return res.json(result);
        } else {
            return res.status(403).json({ success: false, msg: "You are not a premium user" });
        }
    } catch (error) {
        console.error(error);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
});

module.exports = router;

