var express = require('express');
var router = express.Router();

const auth = require("../middlewares/auth.js");
const ContactController = require('../controllers/ContactController');

function checkError(func) {
    try {
        func()
    } catch (error) {
    }
}


router.get('/getall', auth, function (req, res) {
    checkError(() => { ContactController.getContacts(req, res) })
})

router.post('/create', auth, function (req, res) {
    checkError(() => { ContactController.createContact(req, res) })
})

router.post('/write', auth, function (req, res) {
    checkError(() => { ContactController.writeContact(req, res) })
})


router.post('/delete', auth, function (req, res) {
    checkError(() => { ContactController.deleteContact(req, res) })
})

router.get('/getcontacttypes', function (req, res) {
    checkError(() => { ContactController.getContactTypes(req, res) })
})

module.exports = router