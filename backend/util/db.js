// const Sequelize = require('sequelize')
// require('dotenv').config();
// const sequelize = new Sequelize(process.env.DB_NAME ,process.env.DB_USERNAME, process.env.DB_PASSWORD,{
//     dialect :"mysql",
//     host : process.env.DB_HOST
// })

// module.exports = sequelize;

const mongoose = require('mongoose');
require('dotenv').config();

// Connect to MongoDB using Mongoose
//mongodb+srv://Sonika:<password>@cluster0.ordjxhu.mongodb.net/?retryWrites=true&w=majority&appName=Cluster0
mongoose.connect(`mongodb+srv://deoghariasonika:ACdVdT9pYdCMSrWt@expense-tracker-cluster.f3c6efu.mongodb.net/`, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});

// Get the default connection
const db = mongoose.connection;

module.exports = db;