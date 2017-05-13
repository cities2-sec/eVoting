/**
 * Created by VictorMiranda on 03/02/2017.
 */
var express = require('express');
var router = express.Router();
var rsa = require('../../module/rsa');
var bignum = require('bignum');
var CryptoJS = require('crypto');

const BallotBox = require('../model/ballotBoxModel');
const service = require('../../services');



function toVote(req, res){
    //recoger los datos
    var id_anonim = req.body.id_anonim; //de aqui saco su publica para verificar
    var voto = req.body.voto; // de aqui saco su publica para verificar si ha sido firmado por el censo

//recojo el publicKey del usuario y lo paso como parametro a la funcion de verificar.
    //verificarlo y que tenga la forma correcta
    verificar();

    //si es correcto guardamos el voto encriptado con la id_anonim en BD


    return null;
}


//mis funciones
function verificar(publicKey_user){


    //le paso el public key del usuario
    rsa.publicKey.verify(publicKey_user);
}


function openBox (req, res){
    return null;
}

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

//noinspection JSAnnotator
module.exports = {
    toVote,
    openBox
};
