/**
 * Created by VictorMiranda on 03/02/2017.
 */

const ballotBoxModel = require('../model/SchemaBallotBox');
var express = require('express');
var router = express.Router();

//var rsa = require('./rsa-bignum');

var rsa = require('../../module/rsa');

var bignum = require('bignum');
var CryptoJS = require('crypto');

const BallotBox = require('../model/SchemaBallotBox');
const service = require('../../services');


function hexToAscii(hexx) {
    var hex = hexx.toString();//force conversion
    var str = '';
    for (var i = 0; i < hex.length; i += 2)
        str += String.fromCharCode(parseInt(hex.substr(i, 2), 16));
    return str;
}
function convertToHex(str) {
    var hex = '';
    for (var i = 0; i < str.length; i++) {
        hex += '' + str.charCodeAt(i).toString(16);
    }
    return hex;
}
function hexToBase64(str) {
    return btoa(String.fromCharCode.apply(null,
        str.replace(/\r|\n/g, "").replace(/([\da-fA-F]{2}) ?/g, "0x$1 ").replace(/ +$/, "").split(" "))
    );
}
function base64ToHex(str) {
    for (var i = 0, bin = atob(str.replace(/[\r\n]+$/, "")), hex = []; i < bin.length; ++i) {
        var tmp = bin.charCodeAt(i).toString(16);
        if (tmp.length === 1) tmp = "0" + tmp;
        hex[hex.length] = tmp;
    }
    return hex.join(" ");
}

function encryptVotebyPaillier(vote) {

    /*
     https://www.csee.umbc.edu/~kunliu1/research/Paillier.html
     */

    var p = bignum.prime(this.bitlength / 2);
    var q;
    do {
        q = bignum.prime(this.bitlength / 2);
    } while (q.cmp(p) === 0 && q.gcd(p) === 1);
    var n = p.mul(q);
    var lambda = calculateLambda(p, q);
    var g = generateG(lambda, n);
    var mu = generateMu(lambda, g, n);
    var r = bignum.rand(0, n);
    var cryptogram = bignum(g).pow(bignum(vote)).mul(bignum(r).pown(bignum(n), bignum(n).pow(2)));


    function calculateLambda(p, q) {

        var resultado_f1 = bignum(p).sub(1).mul(bignum(q).sub(1));
        var resultado = bignum(resultado_f1).div(bignum(p).sub(1).gcd(bignum(q).sub(1)));
        return resultado;
    }

    function generateG(n) {
        var alpha = bignum.rand(0,n);
        var beta = bignum.rand(0,n);

        var resultado_f1 = bignum(alpha).mul(bignum(n)).add(1);
        var g = bignum(resultado_f1).mul(bignum(beta).pown(n, bignum(n).pow(2)));
        return g;
    }

    function generateMu(lambda, g, n) {

        var resultado_f1 = bignum(g).pow(bignum(lambda)).mod(bignum(n).pow(2)).sub(bignum('1').div(bignum(n)));
        var resultado = resultado_f1.mod(bignum(n));
        return resultado;
    }

    return cryptogram;
}

function toVote(req, res) {

    var voto = req.body.voto;

    var sp = voto.split("%");
    var partyid = sp[0];
    var id = sp[1];
    var pk = sp[2];

    //busca por la id_anonim si esta en la BD

    //si lo es desencriptamos con la publica del usuario

    console.log("Voto BD:");
    console.log(sp[0]);
    console.log(sp[1]);
    console.log(sp[2]);

}

/*
 function toVote(req, res){
 //me deben mandar el voto firmado q ya contiene el voto encriptado, la id_anonima, Kcenso

 //recoger los datos
 var id_anonim = req.body.id_anonim; //de aqui saco su publica para verificar
 var voto_firmado_encriptado = req.body.voto; // de aqui saco su publica para verificar si ha sido firmado por el censo
 var Kcenso = req.body.Kpublic_censo;
 //recojo el publicKey del usuario y lo paso como parametro a la funcion de verificar.
 //verificarlo y que tenga la forma correcta
 verificar(voto_firmado_encriptado, Kcenso);

 //si es correcto guardamos el voto encriptado con la id_anonim en BD


 return null;
 }
 */
//mis funciones
function verificar(voto_firmado_encriptado, Kcenso) {

    //Kcenso --> klave rsa generado
    var mensajeoriginal = Kcenso.publicKey.verify(voto_firmado_encriptado); //verifico el voto firmado
    var mensajeoriginalhex = mensajeoriginal.toString(16);
    var mensajeoriginalascii = hexToAscii(mensajeoriginalhex);
    console.log(mensajeoriginalascii + ' su voto: ' + voto);

    var str = mensajeoriginalascii.slice(0, 6);
    //comprobamos si_tiene nuestra_identificador en la posición que toque
    if (str = '201617') {
        //es valido entonce meto el voto con la id_anonim en la BD
    }
    else {
        //no valido
    }
}


function openBox(req, res) {
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
