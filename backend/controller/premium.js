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
        try {
            if (req.user.isPremiumUser) {
                // If the user is premium, fetch all users with additional attributes
                const users = await User.find({})
                    .select('id name totalAmount')
                    .sort({ totalAmount: -1 }); // Sort by totalAmount in descending order
                return res.json(users);
            } else {
                return res.status(403).json({ success: false, msg: "You are not a premium user" });
            }
        } catch (error) {
            console.error(error);
            return res.status(500).json({ success: false, msg: "Internal server error" });
        }
    }