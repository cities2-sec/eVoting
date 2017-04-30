/**
 * Created by VictorMiranda on 03/02/2017.
 */

const services = require('../services');

function isAuth(req, res, next) {
    if(!req.headers.authorization){
        return res.status(403).send({message: "ERROR: You are not allowed"});
    }
    const token = req.headers.authorization.split(' ')[1];

    services.decodeToken(token)
    .then(function (response){
            req.user = response
            next()
        })
    .catch(function (response){
        res.status(response.status)
        })
}

module.exports =  isAuth;
