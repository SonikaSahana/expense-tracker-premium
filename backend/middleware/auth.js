const jwt = require('jsonwebtoken');
require('dotenv').config();

const User = require('../models/user')

// const authenticate = async(req ,res ,next)=>{
//     try{
//         const token = req.headers['auth-token'];
//         console.log(token)
//         const data = jwt.verify(token , process.env.JWT_TOKEN)
//         console.log(data)
//         const user = await User.findByPk(data.id)
//         req.user = user;
//         req.isPremiumUser = data.isPremiumUser;
//         next() //proceed with the request


//     }catch(e){
//         console.log(e)
//         return res.status(500).json({success : false , msg : "Internal server error"})
//     }
// }
const authenticate = async (req, res, next) => {
    try {
        const token = req.headers['auth-token'];
        console.log(token);

        // Verify the token
        const data = jwt.verify(token, process.env.JWT_TOKEN);
        console.log(data);

        // Find the user by ID
        const user = await User.findById(data.id);
        if (!user) {
            return res.status(401).json({ success: false, msg: "User not found" });
        }

        // Attach user and premium status to the request object
        req.user = user;
        req.isPremiumUser = data.isPremiumUser;

        next(); // Proceed with the request
    } catch (error) {
        console.error(error);
        return res.status(401).json({ success: false, msg: "Invalid token" });
    }
};

module.exports = authenticate;