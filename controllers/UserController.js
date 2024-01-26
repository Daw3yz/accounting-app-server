const models = require("../models/index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

function getAllUsers(req, res) {
  models.User.findAll()
  .then(function (result) {
    res.json(result)
  })
  .catch(function (error) {
    res.json({ error: error });
  });
}

function getUsersById(req, res) {
  models.User.findAll({
    where:{
      id: JSON.parse(req.query.ids)
    }
  })
  .then(function (result) {
    res.json(result)
  })
  .catch(function (error) {
    res.json({ error: error });
  });
}

function getCurrentUser(req, res){
  models.User.findAll({
    where:{
      id: req.userDecoded.id
    }
  })
  .then(function (result) {
    res.json(result)
  })
  .catch(function (error) {
    res.json({ error: error });
  });
}

function createUser(req, res) {
    let salt = bcrypt.genSaltSync();
    let hash = bcrypt.hashSync(req.body.password, salt);
    if (req.body.username == null || req.body.email == null || req.body.password == null) {
        res.json({ error: "Please provide all information" });
    }
    models.User.create({
        username: req.body.username,
        email: req.body.email,
        password: hash,
    })
    .then(function (result) {
        res.json(result);
    })
    .catch(function (error) {
        res.json({ error: error });
    });
}

function updateUser(req, res) {
  let salt = bcrypt.genSaltSync();
  let hash = bcrypt.hashSync(req.body.password, salt);
  models.User.update({
    username: req.body.username,
    email: req.body.email,
    password: hash,
  },{
    where: {
      id: req.body.id
    }
  })
  .then(function (result) {
    res.json(result);
  })
  .catch(function (error) {
      res.json({ error: error });
  });
}

function deleteUser(req, res) {
  models.User.destroy({
    where: {
      id: req.body.id
    }
  })
  .then(function (result) {
    res.json(result);
  })
  .catch(function (error) {
      res.json({ error: error });
  });
}

function loginUser(req, res) {
  const email = req.body.email
  const password = req.body.password

  models.User.findOne({
    where:
      {
        email: email
      }
  })
  .then(function (result) {
    if (bcrypt.compareSync(password, result.password)){
      res.json({
        message: "success",
        token: jwt.sign({id: result.id}, process.env.JWT_KEY),
      })
    }
    else{
      res.json({error:"Login Failed"})
    }
  }).catch(function (error){
    res.json({error: error})
  });
}


module.exports = {
  getAllUsers,
  getUsersById,
  createUser,
  updateUser,
  deleteUser,
  loginUser,
  getCurrentUser,
};