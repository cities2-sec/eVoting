/**
 * Aauthorization { Bear "Token" }
 */

const services = require('../services');
const User = require('../censo/model/SchemaUser')

function isAuth(req, res, next) {
    if(!req.headers.authorization){
        return res.status(403).send({message: "ERROR: You are not allowed"});
    }
    const token = req.headers.authorization.split(' ')[1];

    services.decodeToken(token)
        .then(function (response){
            var username = response;
            User.findOne({username: username}, function(err, user) {
                if(err) {
                    return res.status(500).json("Token not valid");
                }
                req.user = user;
                next();
            })

        })
        .catch(function (response){
            return res.sendStatus(500);
        })
}

 module.exports =  isAuth;
