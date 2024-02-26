const express = require('express')

const router = express.Router()
var Brevo = require('@getbrevo/brevo');
//var SibApiV3Sdk = require('sib-api-v3-sdk');

require('dotenv').config()
const bcrypt = require('bcrypt')


const User = require('../models/user')
const resetPassword = require('../models/resetPassword')

const sequelize = require('../util/db')

router.post('/forgot-password' , async(req,res)=>{
    try{
        const email = req.body.email
        const user = await User.findOne({where : {email : email}},{
            include : [
                {model : resetPassword}
            ]
        })
        console.log(user)
        console.log(user== null)
        if(user === null)
             return res.status(404).json({success : false , msg :"Email not found"})
        var defaultClient = Brevo.ApiClient.instance;
        var apiKey = defaultClient.authentications['api-key'];
        apiKey.apiKey = process.env.BRAVO_API_KEY
        var apiInstance = new Brevo.TransactionalEmailsApi();
        //deoghariasonika@gmail.com
        const sender = { "email": "deoghariasonika@gmail.com"}

        const reciever = [{
            "email": req.body.email
        }]
        const link = await user.createResetPassword()

        const response = await apiInstance.sendTransacEmail({
            sender,
            to : reciever,
            subject : 'Reset password for Expense Tracker App',
            htmlContent: '<p>Click the link to reset your password</p>'+
            `<a href="http://3.25.113.52:4000/reset-password.html?reset=${link.id}">click here</a>`,
        })
        return res.json({success : true ,link})
    }catch(e){
        console.log(e)
        return res.status(500).json({success : false ,msg :"Internal server error"})
    }
})

// router.post('/forgot-password' , async(req,res)=>{
//     // try{
//     //     // const {email} = req.body;
//     //     // console.log(email);
//     //     // const user = await User.findAll({where : {email : email}},{
//     //     //     include : [
//     //     //         {model : FP}
//     //     //     ]
//     //     // })
//     //     // console.log(user)
//     //     // console.log(user== null)
//     //     // if(user === null)
//     //     //      return res.status(404).json({success : false , msg :"Email not found"})

//     //     var defaultClient = Brevo.ApiClient.instance;
//     //     var apiKey = defaultClient.authentications['api-key'];
//     //     apiKey.apiKey = "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"

//     //     var apiInstance = new Brevo.TransactionalEmailsApi();

//     //     const sender = { "email": "deoghariasonika@gmail.com"}

//     //     const reciever = [{
//     //         "email":"deoghariasonika@gmail.com"
//     //     }]
//     //     // const link = await user.createFP();
//     //     const response = await apiInstance.sendTransacEmail({
//     //         sender,
//     //         to : reciever,
//     //         subject : 'testing',
//     //         textContent: 'hello , this is a text content',
//     //     })
//     //     return res.json({success : true , response})


//     // }catch(e){
//     //     console.log(e)
//     //     return res.status(500).json({success : false ,msg :"Internal server error"})
//     // }
//     let defaultClient = brevo.ApiClient.instance;

// let apiKey = defaultClient.authentications['api-key'];
// apiKey.apiKey = 'xkeysib-=-ARz5BkyQPanNIyEq';

// let apiInstance = new brevo.TransactionalEmailsApi();
// let sendSmtpEmail = new brevo.SendSmtpEmail();

// sendSmtpEmail.subject = "test code";
// sendSmtpEmail.htmlContent = "<html><body><h1>Common: This is my first transactional email </h1></body></html>";
// sendSmtpEmail.sender = { "name": "sonika", "email": "deoghariasonika@gmail.com" };
// sendSmtpEmail.to = [
//   { "email": "sonikamukherjee24@gmail.com", "name": "puchu" }
// ];
// sendSmtpEmail.replyTo = { "email": "deoghariasonika@gmail.com", "name": "deoghariasonika@gmail.com" };
// sendSmtpEmail.headers = { "Some-Custom-Name": "unique-id-1234" };
// sendSmtpEmail.params = { "parameter": "My param value", "subject": "common subject" };


// apiInstance.sendTransacEmail(sendSmtpEmail).then(function (data) {
//   console.log('API called successfully. Returned data: ' + JSON.stringify(data));
// }, function (error) {
//   console.error(error);
// });
// })


router.post('/reset-password/:resetId' , async(req,res)=>{
    const t = await sequelize.transaction()
    try{
        const resetId = req.params.resetId;
        const newPassword = req.body.newPassword
        const confirmPassword = req.body.confirmPassword

        const resetUser = await resetPassword.findByPk(resetId)
        if(!resetUser.isActive){
            return res.status(401).json({success : false , msg:"link expired create a new one"})
        }
        if(newPassword !== confirmPassword)
        return res.status(403).json({success : false , msg:"new and confirm password are different"})
    
    const user = await resetUser.getUser()
    const hash = await bcrypt.hash(newPassword,10)

    await user.update({password : hash},{transaction :t})
    await resetUser.update({isActive : false},{transaction : t})

    await t.commit()

    return res.json({success : true , msg:"Password changed successfully"})
    }catch(e){
        console.log(e)
        await t.rollback()
        return res.status(500).json({success : false , msg : "Internal server error"})
    }
})


router.get('/check-password-link/:resetId', async(req,res)=>{
    try{
        const resetUser = await resetPassword.findByPk(req.params.resetId)
        return res.json({isActive : resetUser.isActive})
    }catch(e){
        console.log(e)
        return res.status(500).json({success : false , msg : "Internal server error"})
    }
})



module.exports = router;