var express = require('express');
var router = express.Router();

const auth = require("../middlewares/auth.js");
var UserController = require("../controllers/UserController.js");


router.get('/getall', auth, function (req, res) {
  UserController.getAllUsers(req, res)
});

router.get('/getcurrentuser', auth, function (req, res) {
  UserController.getCurrentUser(req, res)
});

router.post('/create', function (req, res) {
  UserController.createUser(req, res)
});

router.post('/update-password', auth, function (req, res) {
  UserController.updateUserPassword(req, res)
});

router.post('/delete', auth, function (req, res) {
  UserController.deleteUser(req, res)
});

router.post('/approve-users', auth, function (req, res) {
  UserController.approveUsers(req, res)
});

router.post('/login', function (req, res) {
  UserController.loginUser(req, res)
});


module.exports = router;
