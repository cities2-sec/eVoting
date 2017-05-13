/**
 * Created by VictorMiranda on 03/02/2017.
 */
var express = require('express');
var router = express.Router();
var rsa = require('./rsa-bignum');
var bignum = require('bignum');
var CryptoJS = require('crypto-js');

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


//noinspection JSAnnotator
module.exports = {
    toVote
};
