const jwt = require("jsonwebtoken");
const models = require("../models/index");

module.exports = (req, res, next) => {
  let token = req.headers.token;
  if (token) {
    let verify = jwt.verify(token, process.env.JWT_KEY);

    models.User.findOne({
      where: {
        id: verify.id,
      },
    })
      .then(function (result) {
        if (result) {
          req.userDecoded = verify;
          req.isAdmin = result.role == 'admin';
          req.isUser = result.role == 'user';
          next();
        } else {
          res.status(401).json({
            message: "You do not have access",
          });
        }
      })
      .catch(function (error) {
        res.json({
          error: error
        });
      });
  } else {
    res.status(401).json({
      message: "Please login first",
    });
  }
};