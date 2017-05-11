/**
 * Created by VictorMiranda on 03/02/2017.
 */

const User = require('../model/SchemaUser');
const service = require('../../services');

function register(req, res){
    const user = new User({
        username: req.body.username,
        displayName: req.body.displayName,
        email: req.body.email,
        password: req.body.password
    });
    user.save(function (err) {
        if(err) {
            console.log(err);
            return res.status(500).send("Server error");
        }
        return res.status(201).send({token: service.createToken(user)});
    })
}

function login(req, res) {
    User.find({ email: req.body.email }, function(err, user){
        if(err){
            return res.status(500).send({message:`${err}`});
        }
        if (!user){
            return res.status(484).send({message: "User doesn't exists"})
        }
        else{
            req.user = user;
            res.status(200).send({
                message: "Login",
                token: service.createToken(user)
            });
        }
    })
}

function authUser(req, res) {
    res.status(200).send({message: "You have access"})
}

function censoStats(req, res) {
    // Devuelve información sobre el estado de las votaciones
    var censo = 0; // Nº de usuarios en el censo
    var usersWithIdentity = 0; // Nº de usuarios que han solicitado identidad anonima

    User.find({
        identityGivenDate: { $ne: null }
    }, function(err, users) {
        if(err) {
            console.log(err);
            return res.status(500).json("Server error");
        }
        usersWithIdentity = users.length;
        User.find().count(function(err, count) {
            if(err) {
                console.log(err);
                return res.status(500).json("Server error");
            }
            censo = count;
            var msg = {
                "censo": censo,
                "usersWithIdentity": usersWithIdentity
            }
            res.status(200).json(msg);
        });
    });

}

module.exports = {
    login,
    register,
    authUser,
    censoStats
}
