const Sequelize = require('sequelize')

const sequelize = require('../util/db')

const Expense = sequelize.define('expense', {
    id: {
        type: Sequelize.INTEGER,
        allowNull: false,
        primaryKey: true,
        autoIncrement: true
    },
    expense: {
        type: Sequelize.INTEGER,
        allowNull: false
    },
    description: {
        type: Sequelize.STRING,
        allowNull: false
    },
    category: {
        type: Sequelize.STRING,
        allowNull: false
    },
    createdAt : {
        type : Sequelize.DATEONLY,
        defaultValue : Sequelize.NOW
    }
},
    {
        timestamps: false

    })

module.exports = Expense;