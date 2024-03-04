const Expense = require('../models/expense')
const sequelize = require('../util/db')

const S3Services = require('../services/s3services')

exports.getAll = (req, res) => {
    req.user.getExpenses({
        raw: true,
        attributes: ["id", "expense", "category", "description"]
    })
        .then(data => {
            return res.json({ data })
        })
        .catch(e => {
            console.log(e)
            return res.status(500).json({ msg: "Internal server error" })
        })
}

exports.addExpense = async (req, res) => {
    const expense = req.body.expense;
    const description = req.body.description;
    const category = req.body.category;
    const t = await sequelize.transaction()

    req.user.createExpense({
        expense: expense,
        description: description,
        category: category
    }, {
        transaction: t
    }).then(async (data) => {
        let newAmount = req.user.totalAmount + +expense;
        await req.user.update({ totalAmount: newAmount }, {
            transaction: t
        })
        await t.commit()
        return res.json({ data })
    })
        .catch(async e => {
            console.log(e)
            await t.rollback()
            return res.status(403).json({ success: false })
        })
}

exports.deleteExpense = (req, res) => {
    const id = req.params.id;
    req.user.getExpenses({ where: { id: id } }).then(async expense => {
        req.user.totalAmount = Number(req.user.totalAmount) - Number(expense[0].expense)
        console.log(expense)
        await req.user.save()
        return expense[0].destroy()
    }).then(() => {
        return res.status(200).json({ success: true, msg: "deleted successfully" })
    }).catch(e => {
        console.log(e)
        return res.status(401).json({ success: false })
    })
}

exports.editExpense = (req, res) => {
    const id = req.params.id;
    req.user.getExpenses({ where: { id: id } }).then(data => {
        data[0].expense = req.body.expense,
            data[0].description = req.body.description,
            data[0].category = req.body.category
        return data[0].save()
    }).then(() => {
        return res.json({ success: true })
    }).catch(e => {
        console.log(e)
        return res.status(403).json({ success: false })
    })
}

exports.getExpenses = async (req, res) => {
    try {
        const page = +req.query.page || 1
        const items = +req.body.items || 5
        console.log(items)
        const exp =  req.user.getExpenses({
            offset: (page - 1) * items,
            limit: items
        })
        const totalExp =  req.user.countExpenses()
        const [expenses ,totalExpenses ] = await Promise.all([exp , totalExp])
        return res.json({ expenses, totalExpenses })
    } catch (e) {
        console.log(e)
        return res.status(500).json({ success: false, msg: "Internal server error" })
    }
}

exports.downloadExpenses = async(req,res)=>{
    try{
        const expenses = await req.user.getExpenses();
        const expensesToString = JSON.stringify(expenses)
        const fileName = `expense${req.user.id}/${new Date()}.txt`
        const fileUrl = await S3Services.uploadToS3(expensesToString , fileName);
        let url = fileUrl.Location
        console.log("Print ****",req)
        await req.user.createDownload({url : url})
        return res.json({fileUrl  :fileUrl.Location , success : true})
    }catch(e){
        console.log(e)
        return res.status(500).json({success : false , msg : "Internal server error"})
    }
}

exports.downloadUrls = async(req,res)=>{
    try{
        const urls = await req.user.getDownloads();
        return res.json({success : true , urls})
    }catch(e){
        console.log(e)
        return res.status(500).json({success: false , msg :"Internal server error"})
    }
}