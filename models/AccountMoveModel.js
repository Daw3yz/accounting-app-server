const { Sequelize } = require('sequelize')
const db = require('../config/Database')
const { User } = require("./UserModel");
const { Contact } = require("./ContactModel");

const AccountMove = db.define('account_move', {
    'notes': {
        type: Sequelize.STRING
    },
    'credit': {
        type: Sequelize.FLOAT
    },
    'debit': {
        type: Sequelize.FLOAT
    },


})

AccountMove.belongsTo(Contact, { as: 'source', onDelete: 'SET NULL' })
AccountMove.belongsTo(User, { as: 'createdBy', onDelete: 'SET NULL' })
AccountMove.belongsTo(User, { as: 'kasir', onDelete: 'SET NULL' })

module.exports = { AccountMove };

(async () => {
    await db.sync();
})();