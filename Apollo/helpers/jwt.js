const jwt = require(`jsonwebtoken`)

function signToken (value){
    var token = jwt.sign(value, process.env.JWT_SECRET)
    return token
}
function verifyToken (value){
    var decoded = jwt.verify(value, process.env.JWT_SECRET);
    return decoded
}

module.exports = {signToken, verifyToken}