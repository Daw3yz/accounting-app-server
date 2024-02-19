const models = require('../models/index')
const { Sequelize, Op } = require('sequelize')

function getContacts(req, res) {
    if (!(req.isAdmin || req.isUser)) {
        res.json({ error: "You do not have access" });
        return
    }

    let whereParams = {}

    whereParams = req.query.where ? JSON.parse(req.query.where) : {}
    for (let col in whereParams) {

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

    models.Contact.findAll({
        where: whereParams,
        attributes: [
            'id',
            'name',
            'type',
            'phone',
            'email'
        ],
    })
        .then(function (result) {
            res.json(result)
        }).catch(function (error) {
            res.json({
                error: error
            })
        })
}

function createContact(req, res) {
    if (!(req.isAdmin || req.isUser)) {
        res.json({ error: "You do not have access" });
        return
    }
    models.Contact.create({
        createdById: req.userDecoded.id,
        name: req.body.name,
        type: req.body.type,
        phone: req.body.phone,
        email: req.body.email,
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

function writeContact(req, res) {
    if (!(req.isAdmin || req.isUser)) {
        res.json({ error: "You do not have access" });
        return
    }
    models.Contact.findByPk(req.body.id).then(function (result) {
        if (result) {
            result.update({
                name: req.body.name,
                type: req.body.type,
                phone: req.body.phone,
                email: req.body.email,
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
                error: "You are not authorized to edit this contact"
            })
        }
    })
}

function deleteContact(req, res) {
    if (!(req.isAdmin || req.isUser)) {
        res.json({ error: "You do not have access" });
        return
    }
    req.body['ids[]'] = typeof (req.body['ids[]']) != 'object' ? [req.body['ids[]']] : req.body['ids[]']

    idsToDelete = models.Contact.findAll({
        where: {
            id: req.body['ids[]'],
        }
    }).then(function (result) {
        if (result.length == 0) {
            res.json({
                error: "Delete of Contact failed"
            })
        } else {
            idsDeleted = []
            result.forEach(element => {
                idsDeleted.push(element.id)
                element.destroy()
            });

            message = "Delete of contact successful"
            if (idsDeleted.length != req.body['ids[]'].length) {
                message = "Delete Partially Succesful, some of the contacts could not be deleted "
                    + JSON.stringify(req.body['ids[]'].filter((ele) => { return !idsDeleted.includes(Number(ele)) }))
            }
            res.json({
                message: message

            })
        }
    }).catch(function (error) {
        console.log(error)
        res.json({
            error: "Delete of contact failed"
        })
    })
}

function getContactTypes(req, res) {


    let typeValues = models.Contact.rawAttributes.type.values
    res.json(typeValues)
}

module.exports = {
    getContacts,
    createContact,
    writeContact,
    deleteContact,
    getContactTypes
}