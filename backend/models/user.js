const Sequelize = require('sequelize')

const sequelize = require('../util/db')

const User = sequelize.define('user', {
    id : {
        type : Sequelize.INTEGER,
        allowNull  : false,
        primaryKey : true,
        autoIncrement : true
    },
    name : {
        type : Sequelize.STRING,
        allowNull : false
    },
    email : {
        type : Sequelize.STRING,
        allowNull : false,
        unique: true

    },
    password : {
        type : Sequelize.STRING,
        allowNull : false
    },
    isPremiumUser : {
        type:    Sequelize.BOOLEAN,
        defaultValue : false
    },
    totalAmount : {
        type: Sequelize.INTEGER,
        defaultValue : 0
    }
    
})

module.exports = User;