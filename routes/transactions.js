var express = require('express');
var router = express.Router();

const auth = require("../middlewares/auth.js");
const TransactionController = require('../controllers/TransactionController');

router.get('/getall', auth, function (req, res) {
    TransactionController.getTransactions(req, res)
})

router.post('/create', auth, function (req, res) {
    TransactionController.createTransaction(req, res)
})

router.post('/write', auth, function (req, res) {
    TransactionController.writeTransaction(req, res)
})

module.exports = router