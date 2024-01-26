const express = require('express')
const { Sequelize } = require('sequelize')
const db = require('../config/Database')
const {User} = require("../models/UserModel");

const Transaction = db.define('transactions', {
    'amount': {
        type: Sequelize.FLOAT,
        default: 0
    },
    'notes': {
        type: Sequelize.STRING
    },
})

Transaction.belongsTo(User, {as: 'userTo'})
Transaction.belongsTo(User, {as: 'userFrom'})

module.exports = {Transaction};

(async() => {
    await db.sync();
})();