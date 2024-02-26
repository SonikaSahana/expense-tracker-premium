const express = require('express')

const router = express.Router()

const auth = require('../middleware/auth')


const premiumController = require('../controller/premium')


router.get('/showleaderboard', auth , premiumController.showLeaderBoard)

router.get('/checkPremium' , auth , premiumController.checkPremium)

module.exports = router;