// const Sequelize = require('sequelize')
// const sequelize = require('../util/db')

// const resetPassword = sequelize.define('resetPassword',{
//     id :{
//         type : Sequelize.UUID,
//         defaultValue : Sequelize.UUIDV4,
//         primaryKey : true
//     },
//     isActive : {
//         type : Sequelize.BOOLEAN,
//         defaultValue : true
//     }
// })

// module.exports = resetPassword;
const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const resetPasswordSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
});


const resetPassword = mongoose.model('resetPassword', resetPasswordSchema);
module.exports = resetPassword;
