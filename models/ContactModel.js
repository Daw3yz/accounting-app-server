const { Sequelize } = require('sequelize')
const db = require('../config/Database')

const Contact = db.define('contact', {
    'name': {
        type: Sequelize.STRING,
    },
    'type': {
        type: Sequelize.ENUM('customer', 'bank'),
    },
    'phone': {
        type: Sequelize.STRING
    },
    'email': {
        type: Sequelize.STRING
    },
})

module.exports = { Contact };

(async () => {
    await db.sync();
})();