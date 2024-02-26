const Sequelize = require('sequelize')

const sequelize = new Sequelize('sonika' ,'root', 'password',{
    dialect :"mysql",
    host : "localhost"
})

module.exports = sequelize;