var express = require('express');
var router = express.Router();

const auth = require("../middlewares/auth.js");
const AccountMoveController = require('../controllers/AccountMoveController');

function checkError(func) {
    try {
        func()
    } catch (error) {
        console.log(error)
        return
    }
}


router.get('/getall', auth, function (req, res) {
    checkError(() => { AccountMoveController.getAccountMoves(req, res) })
})

router.post('/create', auth, function (req, res) {
    checkError(() => { AccountMoveController.createAccountMove(req, res) })
})

router.post('/write', auth, function (req, res) {
    checkError(() => { AccountMoveController.writeAccountMove(req, res) })
})


router.post('/delete', auth, function (req, res) {
    checkError(() => { AccountMoveController.deleteAccountMove(req, res) })
})

module.exports = router