var bcrypt = require('bcryptjs');


function hashPassword(value){
    var salt = bcrypt.genSaltSync(10);
    var value = bcrypt.hashSync(value, salt);
    return value
}

function checkPassword(pass, value){
    return bcrypt.compareSync(pass, value)
}

module.exports = {hashPassword, checkPassword}