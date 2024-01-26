const { Sequelize } = require("sequelize");

const db = new Sequelize('project_1_db', 'root', '', {
    host: 'localhost',
    dialect: 'mysql'
})

module.exports = db