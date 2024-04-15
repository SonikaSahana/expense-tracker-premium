// const Sequelize = require('sequelize')

// const sequelize = require('../util/db')

// const Expense = sequelize.define('expense', {
//     id: {
//         type: Sequelize.INTEGER,
//         allowNull: false,
//         primaryKey: true,
//         autoIncrement: true
//     },
//     expense: {
//         type: Sequelize.INTEGER,
//         allowNull: false
//     },
//     description: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     category: {
//         type: Sequelize.STRING,
//         allowNull: false
//     },
//     createdAt : {
//         type : Sequelize.DATEONLY,
//         defaultValue : Sequelize.NOW
//     }
// },
//     {
//         timestamps: false

//     })

// module.exports = Expense;

const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);

const ExpenseSchema = new mongoose.Schema({
    user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  expense: {
    type: Number,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  category: {
    type: String,
    required: true
  },
  createdAt: {
    type: Date,
    default:Date.now
  },
});

// Apply the plugin to the schema
// ExpenseSchema.plugin(autoIncrement, { inc_field: 'id', id: 'expense_id_' });
const Expense = mongoose.model('expense', ExpenseSchema);

module.exports = Expense;
