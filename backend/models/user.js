// const Sequelize = require('sequelize')

// const sequelize = require('../util/db')

// const User = sequelize.define('user', {
//     id : {
//         type : Sequelize.INTEGER,
//         allowNull  : false,
//         primaryKey : true,
//         autoIncrement : true
//     },
//     name : {
//         type : Sequelize.STRING,
//         allowNull : false
//     },
//     email : {
//         type : Sequelize.STRING,
//         allowNull : false,
//         unique: true

//     },
//     password : {
//         type : Sequelize.STRING,
//         allowNull : false
//     },
//     isPremiumUser : {
//         type:    Sequelize.BOOLEAN,
//         defaultValue : false
//     },
//     totalAmount : {
//         type: Sequelize.INTEGER,
//         defaultValue : 0
//     }
    
// })

// module.exports = User;

const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);

const UserSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  isPremiumUser: {
    type: Boolean,
    default: false
  },
  totalAmount: {
    type: Number,
    default: 0
  },
});

// Apply the plugin to the schema
// UserSchema.plugin(autoIncrement, { inc_field: 'id', id: 'user_id_' });
const User = mongoose.model('user', UserSchema);

module.exports = User;