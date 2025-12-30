const jwt = require("jsonwebtoken")

const secret = process.env.JWT_TOKEN;

console.log(process.env.secret);


const generateToken = (payload) =>(jwt.sign(payload, secret, {expiresIn: "1d" }))

const verifyToken = (token) => {
    try{
        return jwt.verify(token, secret);
    }
    catch{
        return null
    }
}

module.exports = {generateToken, verifyToken};