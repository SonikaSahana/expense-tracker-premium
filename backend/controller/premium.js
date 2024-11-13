const Sequelize = require('sequelize')

const Expense = require('../models/expense')
const User = require('../models/user')




exports.checkPremium = async(req ,res)=>{
    try{
        const result = await req.user.isPremiumUser;
        return res.json(result)
    }catch(e){
        console.log(e)
        return res.status(500).json({success : false , msg :"Internal server error"})
    }
}


exports.showLeaderBoard = async(req,res)=>{
    try{
        if(req.user.isPremiumUser){

        
        const result = await User.findAll({
            attributes :[
                'id',
                'name',
               'totalAmount'
            ],
            order : [['totalAmount', 'DESC']]
        })
        console.log(result)
        return res.json(result)
    }else{
        return res.status(403).json({success : false , msg :"you are not a premium user"})

    }
    }catch(e){
        console.log(e)
        return res.status(500).json({success : false , msg :"Internal server error"})
    }
}