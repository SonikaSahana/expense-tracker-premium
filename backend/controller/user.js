const User = require('../models/user')
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken')
require('dotenv').config();

exports.createUser = async (req,res)=>{
    try {
        const { name, email, password } = req.body;
    
        // Check if user with the provided email already exists
        const existingUser = await User.findOne({ email });
        if (existingUser) {
            return res.status(401).json({ success: false, msg: "User already exists" });
        }
    
        // Hash the password
        const hash = await bcrypt.hash(password, 10);
    
        // Create a new user document
        const newUser = new User({ name, email, password: hash });
        const user = await newUser.save();
    
        // Remove password from user object before sending response
        const userWithoutPassword = user.toObject();
        delete userWithoutPassword.password;
    
        return res.json(userWithoutPassword);
    } catch (e) {
        console.error(e);
        return res.status(500).json({ msg: "Internal server error" });
    }

    
//     const name = req.body.name;
//     const email = req.body.email;
//     const password = req.body.password;
//     let result = await User.findOne({where : {email : email}})
//     console.log(result)
//     if(result !== null)
//         return res.status(401).json({success : false , msg : "User already exists"})
//     let hash = await bcrypt.hash(password , 10);
//     const user = await User.create({name : name , email : email , password : hash})
    
//     const userWithoutPassword = user.toJSON();
//     console.log(userWithoutPassword)
//     delete userWithoutPassword.password;
    
//     return res.json(userWithoutPassword);
//     }catch(e){
//         return res.status(500).json({msg : "Internal server error"})
//     }
}


// exports.login = async (req ,res)=>{
//     try{
//         const email = req.body.email;
//         const password = req.body.password;
//         // verify email from users table
//         const user = await User.findOne({where : {email : email}})
        
//         // return 401 (unauthorized user code) and signup message
//         // as user doesn't exist in the users table
//         if(user === null){
//             return res.status(401).json({success : false , msg : "please signup, you are not a memeber"})
//         }
        
//         // since user is not null, that means user exist
//         // verify the password
//         const result = await bcrypt.compare(password ,user.password)
//         if(result){
//             // if password is valid, create a jwt 
//             const token = jwt.sign({id : user.id, isPremiumUser : user.isPremiumUser} , process.env.JWT_TOKEN)
//             console.log(token)
//             return res.json({success : true , token ,isPremiumUser : user.isPremiumUser })
//         }else{
//             return res.status(401).json({success : false , msg : "wrong credentials"})
//         }


//     }catch(e){
//         return res.status(500).json({msg : "Internal server error"})

//     }
// }

exports.login = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Find user by email
        const user = await User.findOne({ email });

        // Return 401 if user does not exist
        if (!user) {
            return res.status(401).json({ success: false, msg: "Please sign up, you are not a member" });
        }

        // Verify password
        const result = await bcrypt.compare(password, user.password);
        if (result) {
            // Create JWT token if password is valid
            const token = jwt.sign({ id: user._id, isPremiumUser: user.isPremiumUser }, process.env.JWT_TOKEN);
            console.log(token);
            return res.json({ success: true, token, isPremiumUser: user.isPremiumUser });
        } else {
            return res.status(401).json({ success: false, msg: "Wrong credentials" });
        }
    } catch (e) {
        console.error(e);
        return res.status(500).json({ msg: "Internal server error" });
    }
};

