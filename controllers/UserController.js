const models = require("../models/index");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { Op } = require('sequelize')

function getAllUsers(req, res) {
  let whereParams = req.query.where ? JSON.parse(req.query.where) : {}
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

  let query = {
    attributes: [
      'id',
      'username',
      'email',
    ],
    where: whereParams
  }
  if (req.isAdmin) {
    query.attributes.push('role');
  }
  if (!(req.isAdmin || req.isUser)) {
    res.json({ error: "You do not have access" });
    return
  }

  models.User.findAll(query)
    .then(function (result) {
      res.json(result)
    })
    .catch(function (error) {
      res.json({ error: error });
    });
}

function getCurrentUser(req, res) {
  models.User.findAll({
    attributes: [
      'id',
      'username',
      'email',
      'role'
    ],
    where: {
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

  if (req.body.username == 'admin') {
    res.json({ error: "Username admin is not allowed" });
    return
  }

  models.User.create({
    username: req.body.username,
    email: req.body.email,
    password: hash,
    role: 'pending'
  })
    .then(function (result) {
      res.json(result);
    })
    .catch(function (error) {
      res.json({ error: error });
    });
}

function updateUserPassword(req, res) {
  if (!(req.isAdmin || req.userDecoded.id == req.body.id)) {
    res.json({ error: "You do not have access" });
    return
  }
  let salt = bcrypt.genSaltSync();
  let hash = bcrypt.hashSync(req.body.password, salt);
  models.User.update({
    password: hash,
  }, {
    where: {
      id: req.body.id
    }
  })
    .then(function (result) {
      if (result[0] == 0) {
        res.json({ error: "Update of User failed" });
      }
      else {
        res.json({ message: "Update of User successful" });
      }
    })
    .catch(function (error) {
      res.json({ error: error });
    });
}

function deleteUser(req, res) {
  if (!req.isAdmin) {
    res.json({ error: "You do not have access" });
    return
  }
  req.body['ids[]'] = typeof (req.body['ids[]']) != 'object' ? [req.body['ids[]']] : req.body['ids[]']

  idsToDelete = models.User.findAll({
    where: {
      id: req.body['ids[]'],
      username: {
        [Op.ne]: 'admin'
      }
    }
  }).then(function (result) {
    if (result.length == 0) {
      res.json({
        error: "Delete of User failed"
      })
    } else {
      idsDeleted = []
      result.forEach(element => {
        idsDeleted.push(element.id)
        element.destroy()
      });

      message = "Delete of user successful"
      if (idsDeleted.length != req.body['ids[]'].length) {
        message = "Delete Partially Succesful, some of the user could not be deleted "
          + JSON.stringify(req.body['ids[]'].filter((ele) => { return !idsDeleted.includes(Number(ele)) }))
      }
      res.json({
        message: message

      })
    }
  }).catch(function (error) {
    console.log(error)
    res.json({
      error: "Delete of user failed"
    })
  })
}

function approveUsers(req, res) {
  if (!req.isAdmin) {
    res.json({ error: "You do not have access" });
    return
  }
  req.body['ids[]'] = typeof (req.body['ids[]']) != 'object' ? [req.body['ids[]']] : req.body['ids[]']

  idsToApprove = models.User.findAll({
    where: {
      id: req.body['ids[]'],
      role: 'pending'
    }
  }).then(function (result) {
    if (result.length == 0) {
      res.json({
        error: "Approve of User failed"
      })
    } else {
      idsApproved = []
      result.forEach(element => {
        idsApproved.push(element.id)
        element.approve(element)
      });

      message = "Approve of user successful"
      if (idsApproved.length != req.body['ids[]'].length) {
        message = "Approve Partially Succesful, some of the user could not be approved "
          + JSON.stringify(req.body['ids[]'].filter((ele) => { return !idsApproved.includes(Number(ele)) }))
      }
      res.json({
        message: message

      })
    }
  }).catch(function (error) {
    console.log(error)
    res.json({
      error: "Delete of user failed"
    })
  })
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
      if (bcrypt.compareSync(password, result.password)) {
        res.json({
          message: "success",
          token: jwt.sign({ id: result.id }, process.env.JWT_KEY),
        })
      }
      else {
        res.json({ error: "Login Failed" })
      }
    }).catch(function (error) {
      res.json({ error: error })
    });
}


module.exports = {
  getAllUsers,
  createUser,
  updateUserPassword,
  deleteUser,
  loginUser,
  getCurrentUser,
  approveUsers,
};