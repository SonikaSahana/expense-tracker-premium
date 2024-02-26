const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/user')

const authenticate = async(req ,res ,next)=>{
    try{
        const token = req.headers['auth-token'];
        console.log("token")
        console.log(token)
        const data = jwt.verify(token , "ff1234ff123")
        console.log(data)
        const user = await User.findByPk(data.id)

        // return res.json({success : true})
        req.user = user;
        req.isPremiumUser = data.isPremiumUser;
        next()


    }catch(e){
        console.log(e)
        return res.status(500).json({success : false , msg : "Internal server error"})
    }
}

module.exports = authenticate;