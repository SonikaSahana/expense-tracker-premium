const express = require('express')

const router = express.Router()
var Brevo = require('@getbrevo/brevo');
//var SibApiV3Sdk = require('sib-api-v3-sdk');

require('dotenv').config()
const bcrypt = require('bcrypt')


const User = require('../models/user')
const ResetPassword = require('../models/resetPassword')

const mongoose = require('../util/db')
router.post('/forgot-password', async (req, res) => {
    try {
        const email = req.body.email;

        // Step 1: Find user by email
        const user = await User.findOne({ email: email });

        // Step 2: Check if user exists
        if (!user) {
            return res.status(404).json({ success: false, msg: "Email not found" });
        }

        // Step 3: Create and save reset password document
        const resetPassword = new ResetPassword({ user_id: user._id }); // Create a new reset password instance
        await resetPassword.save(); // Save the reset password document to generate a unique ID

        const sender = { email: "deoghariasonika@gmail.com" };
        const receiver = [{ email: req.body.email }];

        // Step 4: Send reset password email
        const link = resetPassword._id.toString(); // Convert ObjectId to string for use in email
        // Configure email content and send using Brevo API
        const htmlContent = `<p>Click the link to reset your password</p><a href="http://localhost:4000/reset-password.html?reset=${link}">click here</a>`;
        // (Code for sending email using Brevo API)

        return res.json({ success: true, link: link });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
});

router.post('/reset-password/:resetId', async (req, res) => {
    try {
        const resetId = req.params.resetId;
        const newPassword = req.body.newPassword;
        const confirmPassword = req.body.confirmPassword;

        // Step 1: Find reset password document by ID
        const resetUser = await ResetPassword.findById(resetId);
        
        // Step 2: Check if reset link is active
        if (!resetUser.isActive) {
            return res.status(401).json({ success: false, msg: "Link expired, create a new one" });
        }
        
        // Step 3: Check if new password matches confirm password
        if (newPassword !== confirmPassword) {
            return res.status(403).json({ success: false, msg: "New and confirm passwords are different" });
        }
        
        // Step 4: Update user's password
        const user = await User.findById(resetUser.user_id);
        const hash = await bcrypt.hash(newPassword, 10);
        await user.updateOne({ password: hash });

        // Step 5: Deactivate reset link
        await resetUser.updateOne({ isActive: false });

        return res.json({ success: true, msg: "Password changed successfully" });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
});

router.get('/check-password-link/:resetId', async (req, res) => {
    try {
        const resetUser = await ResetPassword.findById(req.params.resetId);
        return res.json({ isActive: resetUser.isActive });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ success: false, msg: "Internal server error" });
    }
});

module.exports = router;