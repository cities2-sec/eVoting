/**
 * Created by VictorMiranda on 03/02/2017.
 */

const PollingStation = require('../model/pollingStationModel');
const service = require('../../services');



function getKeys (req, res) {
    return res.json({keys: global.PollingStationKey});
}

function getResults (req, res){
    var voting_ended = false;
    if(voting_ended){
        // Función para obtener los votos de la urna
        return null;
    }
    else{
        return res.status(403).send("La votació no ha acabat");
    }
    return null;
}

/*function logIn (req, res){
    const user = new User({
        username: req.body.username,
        displayName: req.body.displayName,
        email: req.body.email,
        password: req.body.password
    });
    user.save(function (err) {
        if(err) {
            return res.status(500).send({message: `ERROR: User not created: ${err}`});
        }
        return res.status(201).send({token: service.createToken(user)});
    })
}*/

/*function signIn(req, res) {
    User.find({ email: req.body.email }, function(err, user){
        if(err){
            return res.status(500).send({message:`${err}`});
        }
        if (!user){
            return res.status(484).send({message: "User doesn't exists"})
        }
        else{
        req.user = user;
            req.status(200).send({
                message: "Login",
                token: service.createToken(user)
            });
        }
    })
}*/

/*function authUser(req, res) {
    res.status(200).send({message: "You have access"})
}*/

module.exports = {
    getKeys,
    getResults
};