const { Sequelize } = require("sequelize");
const db = require("../config/Database.js");
const bcrypt = require("bcryptjs");

const { DataTypes } = Sequelize;

const User = db.define('users', {
    username: DataTypes.STRING,
    email: DataTypes.STRING,
    password: DataTypes.STRING,
    role: DataTypes.STRING,
}, {
    freezeTableName: true
});


// Create admin User
User.findAll({
    where: {
        username: 'admin'
    },
}).then((result) => {
    if (result.length > 0) {
        return
    }
    let salt = bcrypt.genSaltSync();
    let hash = bcrypt.hashSync('admin', salt);
    User.create({
        username: 'admin',
        email: 'admin',
        password: hash,
        role: 'admin',
    })

})

User.prototype.approve = function (user) {
    user.update({
        role: 'user'
    })
}

module.exports = { User };



(async () => {
    await db.sync();
})();