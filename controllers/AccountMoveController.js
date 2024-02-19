const models = require('../models/index')
const { Sequelize, Op } = require('sequelize')

function getAccountMoves(req, res) {

    if (!(req.isAdmin || req.isUser)) {
        res.json({ error: "You do not have access" });
        return
    }

    let whereParams = req.query.where ? JSON.parse(req.query.where) : {}
    let whereParamsNoFkey = {}
    let fkeys = ['createdBy', 'kasir', 'source']
    for (let col in whereParams) {

        if (fkeys.includes(col)) {
            continue
        }

        if (typeof (whereParams[col]) == 'object') {
            let opKey = Object.keys(whereParams[col])[0]
            if (!["eq", "gt", "lt", "gte", "lte", "between"].includes(opKey)) {
                res.json({
                    error: "Invalid operator"
                })
                return
            }
            whereParams[col] = {
                [Op[opKey]]: whereParams[col][opKey]
            }
        } else if (typeof (whereParams[col]) == 'string') {
            whereParams[col] = {
                [Op.like]: `%${whereParams[col]}%`
            }

        }
    }

    Object.keys(whereParams).forEach((key) => {
        if (!['createdBy', 'kasir', 'source'].includes(key)) {
            whereParamsNoFkey[key] = whereParams[key]
        }
    })

    query = {
        where: whereParamsNoFkey,
        attributes: [
            'id',
            'debit',
            'credit',
            'notes',
            'createdAt',
        ],
        include: [
            {
                model: models.User,
                attributes: [
                    'id',
                    'username'
                ],
                as: 'createdBy',
                where: {
                    username: { [Op.like]: `%${whereParams['createdBy'] ? whereParams['createdBy'] : ''}%` }
                }
            },
            {
                model: models.User,
                attributes: [
                    'id',
                    'username'
                ],
                as: 'kasir',
                where: {
                    username: { [Op.like]: `%${whereParams['kasir'] ? whereParams['kasir'] : ''}%` }
                }
            },
            {
                model: models.Contact,
                attributes: [
                    'id',
                    'name'
                ],
                as: 'source',
                where: {
                    name: { [Op.like]: `%${whereParams['source'] ? whereParams['source'] : ''}%` }
                }
            },
        ]
    }

    if (!req.isAdmin) {
        query['include'][1]['where']["id"] = req.userDecoded.id
    }

    models.AccountMove.findAll(query)
        .then(function (result) {
            res.json(result)
        }).catch(function (error) {
            res.json({
                error: error
            })
        })
}

function createAccountMove(req, res) {
    if (!(req.isAdmin || req.isUser)) {
        res.json({ error: "You do not have access" });
        return
    }

    let kasirId = req.userDecoded.id
    if (req.isAdmin) {
        kasirId = parseInt(req.body.kasirId)
    }

    models.AccountMove.create({
        createdById: req.userDecoded.id,
        kasirId: kasirId,
        sourceId: parseInt(req.body.sourceId),
        debit: req.body.debit,
        credit: req.body.credit,
        notes: req.body.notes,
    })
        .then(function (result) {
            res.json(result)
        })
        .catch(function (error) {
            res.json({
                error: error.message
            })
        })
}

function writeAccountMove(req, res) {
    if (!(req.isAdmin || req.isUser)) {
        res.json({ error: "You do not have access" });
        return
    }
    models.AccountMove.findByPk(req.body.id).then(function (result) {

        if (result && (result.kasirId == req.userDecoded.id || req.isAdmin)) {
            result.update({
                kasir: parseInt(req.body.kasir),
                source: parseInt(req.body.source),
                debit: req.body.debit,
                credit: req.body.credit,
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
                error: "You are not authorized to edit this journal entry"
            })
        }
    })
}

function deleteAccountMove(req, res) {
    if (!(req.isAdmin || req.isUser)) {
        res.json({ error: "You do not have access" });
        return
    }
    req.body['ids[]'] = typeof (req.body['ids[]']) != 'object' ? [req.body['ids[]']] : req.body['ids[]']

    idsToDelete = models.AccountMove.findAll({
        where: {
            id: req.body['ids[]'],
        }
    }).then(function (result) {
        if (result.length == 0) {
            res.json({
                error: "Delete of Account Move failed"
            })
        } else {
            idsDeleted = []
            result.forEach(element => {
                if (element.kasirId == req.userDecoded.id || req.isAdmin) {
                    idsDeleted.push(element.id)
                    element.destroy()
                }

            });

            message = "Delete of journal entry successful"
            if (idsDeleted.length != req.body['ids[]'].length) {
                message = "Delete Partially Succesful, some of the journal entries could not be deleted "
                    + JSON.stringify(req.body['ids[]'].filter((ele) => { return !idsDeleted.includes(Number(ele)) }))
            }
            res.json({
                message: message

            })
        }
    }).catch(function (error) {
        console.log(error)
        res.json({
            error: "Delete of journal entry failed"
        })
    })
}

module.exports = {
    getAccountMoves,
    createAccountMove,
    writeAccountMove,
    deleteAccountMove
}