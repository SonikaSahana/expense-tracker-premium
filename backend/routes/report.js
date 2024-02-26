const express = require('express')

const router = express.Router()

const auth = require('../middleware/auth')
const { Op, literal ,fn} = require('sequelize')


router.post('/getdate', auth, async (req, res) => {
    try {
        if (req.user.isPremiumUser) {

            const data = await req.user.getExpenses({ where: { createdAt: req.body.date } })
            return res.json(data)
        } else {

            return res.status(403).json({ success: false, msg: "you are not a premium user" })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({ success: false, msg: "Internal server error" })
    }
})


router.get('/getweekly', auth, async (req, res) => {
    try {
        if (req.user.isPremiumUser) {

            const currDate = new Date()
            currDate.setDate(currDate.getDate() - 7)
            const result = await req.user.getExpenses({
                attributes: [
                    [fn('DAYNAME',literal('createdAt')) , 'week'],
                    [literal('SUM(expense)') , 'totalAmount']
            ], 
                where: {
                    createdAt: {
                        [Op.gt]: currDate
                    }
                },
                group : [fn('DAYNAME',literal('createdAt'))]
            })
            return res.json(result)
        } else {
            return res.status(403).json({ success: false, msg: "you are not a premium user" })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({ success: false, msg: "Internal server error" })
    }
})

router.post('/getMonthly', auth, async (req, res) => {
    try {
        if (req.user.isPremiumUser) {


            const month = req.body.month;
            const startDate = new Date(month);
            const endDate = new Date(startDate.getFullYear(), startDate.getMonth() + 1, 1);
            const result = await req.user.getExpenses({
                attributes : [
                    [fn('DATE' , literal('createdAt')) , 'date'],
                    [literal('SUM(expense)') , 'totalAmount']
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startDate,
                        [Op.lt]: endDate

                    }
                },
                group: [fn('DATE' , literal('createdAt'))]
            })
            return res.json(result)
        } else {
            return res.status(403).json({ success: false, msg: "you are not a premium user" })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({ success: false, msg: "Internal server error" })
    }
})


router.post('/getYearly', auth, async (req, res) => {
    try {
        if (req.user.isPremiumUser) {


            const year = req.body.year;
            const startYear = new Date(year)
            const endYear = new Date(startYear.getFullYear() + 1, 0, 1)
            const result = await req.user.getExpenses({
                attributes: [
                    [fn('MONTHNAME',literal('createdAt')), 'month'],
                    [literal('SUM(expense)'), 'totalAmount'],
                ],
                where: {
                    createdAt: {
                        [Op.gte]: startYear,
                        [Op.lt]: endYear,
                    },
                },
                group: [fn('MONTHNAME',literal('createdAt'))],
                raw: true,
            });
            return res.json(result)
        } else {
            return res.status(403).json({ success: false, msg: "you are not a premium user" })
        }
    } catch (e) {
        console.log(e)
        return res.status(500).json({ success: false, msg: "Internal server error" })
    }
})



module.exports = router;