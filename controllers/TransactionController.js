const models = require('../models/index')
const { Sequelize, Op } = require('sequelize')

function getTransactions(req, res) {
    models.Transaction.findAll({
        where: {
            [Op.or]: [
                { userFromId: req.userDecoded.id },
                { userToId: req.userDecoded.id }
            ]
        },
        attributes: [
            'id',
            'amount',
            'notes',
        ],
        include: [
            {
                model: models.User,
                attributes: [
                    'id',
                    'username'
                ],
                as: 'userFrom'
            },
            {
                model: models.User,
                attributes: [
                    'id',
                    'username'
                ],
                as: 'userTo'
            }
        ]
    })
        .then(function (result) {
            res.json(result)
        })
}

function createTransaction(req, res) {
    models.Transaction.create({
        userFromId: req.userDecoded.id,
        userToId: parseInt(req.body.userToId),
        amount: req.body.amount,
        notes: req.body.notes,
    })
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            res.json({
                error: error
            })
        })
}

function writeTransaction(req, res) {
    models.Transaction.findByPk(req.body.id).then(function (result) {
        if (result && result.userFromId == req.userDecoded.id) {
            result.update({
                userToId: parseInt(req.body.userToId),
                amount: req.body.amount,
                notes: req.body.notes,
            })
                .then(function (result) {
                    res.json(result)
                })
                .catch(function (error) {
                    res.json({
                        error: error
                    })
                })
        } else {
            res.json({
                error: "No record found"
            })
        }
    })
}

module.exports = {
    getTransactions,
    createTransaction,
    writeTransaction
}