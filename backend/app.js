const express = require('express')
const cors = require('cors')
const helmet = require('helmet')
const compression = require('compression')
const morgan = require('morgan')
const fs = require('fs')
const path = require('path')
const https = require('https')

const app = express();

require('dotenv').config()

const mongoose = require('./util/db')

const expenseRoutes = require('./routes/expense')
const userRoutes = require('./routes/user')
const paymentsRoutes = require('./routes/purchase')
const premiumRoutes = require('./routes/premium')

const User = require('./models/user')
const Expense = require('./models/expense')
const Order = require('./models/order')
const Download = require('./models/download')

const passwordRoutes = require('./routes/forgot-password')
const resetPassword = require('./models/resetPassword')
const reportRoutes = require('./routes/report')

app.use(cors()) // enable Cross-Origin Resource Sharing | allowing server to respond to requests from different domains
app.use(express.json()) // parses incoming requests with JSON payloads
// app.use(helmet())
app.use(compression()) // compress the response bodies of all HTTP responses that match the route


const accessLogStream = fs.createWriteStream(path.join(__dirname , 'access.log'),{flags : 'a'})


app.use(morgan('combined',{ stream :accessLogStream})) // logHTTP requests to access.log

// User.hasMany(Expense) // one user can have multiple expenses.
// Expense.belongsTo(User) // each expense belongs to one user.

// User.hasMany(Order) // one user can have multiple orders.
// Order.belongsTo(User) // each Order belongs to one user.

// // Users may forget their passwords and request to reset them multiple times over time.
// User.hasMany(resetPassword)
// resetPassword.belongsTo(User)

// User.hasMany(Download)
// Download.belongsTo(User)

// routes requests based on path
app.use('/expense' , expenseRoutes)
app.use('/user' , userRoutes)
app.use('/payment' , paymentsRoutes)
app.use('/premium' , premiumRoutes)
app.use('/password', passwordRoutes)
app.use('/report' , reportRoutes)
// serve static files HTML, CSS, JavaScript, images from frontend directory from the current app server to the client.
app.use(express.static(path.join(__dirname , '..' , 'frontend')))

// sequelize
// .sync()  // synchronize the database schema with the models defined in backend/models
// // .sync({force : true})
// .then((result) => {
//     console.log("listening on port 4000")
//     app.listen(4000) //  starts listening on port 4000.
// }).catch(e => console.log(e))

// Load all models
const modelsPath = path.join(__dirname, 'models');
fs.readdirSync(modelsPath).forEach(file => {
  require(path.join(modelsPath, file));
});

// Event handlers for connection
mongoose.on('error', console.error.bind(console, 'MongoDB connection error:'));
mongoose.once('open', () => {
  console.log('Connected to MongoDB database successfully.');
  
  // Start your Express server after successful database connection
  app.listen(4000, () => {
    console.log('Server is running on port 3000');
  });
});

