var express = require('express');
var router = express.Router();

const auth = require("../middlewares/auth.js");
var UserController = require("../controllers/UserController.js");


router.get('/getall', function (req, res) {
  UserController.getAllUsers(req, res)
});

router.get('/getbyid', function (req, res){
  UserController.getUsersById(req, res)
});

router.get('/getcurrentuser', auth, function (req, res){
  UserController.getCurrentUser(req, res)
});

router.post('/create', function (req, res) {
  UserController.createUser(req, res)
});

router.post('/update', function (req, res) {
  UserController.updateUser(req, res)
});

router.post('/delete', function (req, res) {
  UserController.deleteUser(req, res)
});

router.post('/login', function (req, res) {
  UserController.loginUser(req, res)
});


module.exports = router;
