// const Sequelize = require('sequelize')

// const sequelize = require('../util/db')

// const Order = sequelize.define('order' , {
//     id : {
//         type : Sequelize.INTEGER,
//         autoIncrement  : true , 
//         primaryKey : true,
//         allowNull : false

//     },
//     order_id : Sequelize.STRING,
//     payment_id : Sequelize.STRING,
//     status : Sequelize.STRING
// })

// module.exports = Order;

const mongoose = require('mongoose');
const autoIncrement = require('mongoose-sequence')(mongoose);

const OrderSchema = new mongoose.Schema({
  user_id: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true
  },
  order_id: {
    type: String,
  },
  payment_id: {
    type: String,
  },
  status: {
    type: String,
  },
});

// Apply the plugin to the schema
// OrderSchema.plugin(autoIncrement, { inc_field: 'id', id: 'order_id_' });
const Order = mongoose.model('order', OrderSchema);

module.exports = Order;