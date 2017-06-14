/**
 * Created by VictorMiranda on 03/02/2017.
 */

const KeysPaillier = require('../../model/SchemaKeysPaillier');
var express = require('express');
var router = express.Router();
var paillier = require('../../module/paillier');
const bcrypt = require('bcrypt-nodejs');
var rsa = require('../../module/rsa');
const Keys = require('../../model/SchemaKeys');

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
        var alpha = bignum.rand(0, n);
        var beta = bignum.rand(0, n);

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


//getPaillierkEYS

function getKeysPaillier(req, res) {

    KeysPaillier.find(function (err, kPaillier) {
        if (err) {
            console.log(err);
            return res.status(500).json("Server error");
        }
        res.status(200).json(kPaillier);
    });
}

function toVote(req, res) {

    var votoencrip_firmado = bignum(req.body.votoencrip_firmado);
    var Hash = req.body.Hash;
    var CpubKey = req.body.CpubKey;
    console.log("CpubKey :" + CpubKey);
    var spl = CpubKey.split(".");
    var CpubKey_e = bignum(spl[0],16);
    console.log("E: "+CpubKey_e);
    console.log("split:"+spl[1]);
    var CpubKey_n = bignum(spl[1], 16);
    console.log("CpubKey :" + CpubKey_n);
    var id_anonim = bignum(req.body.id_anonim);
    var CensoKey;

    console.log("Voto BD:");
    console.log("Voto Encriptado y firmado: " +votoencrip_firmado);
    console.log("HASH: "+Hash);
    console.log("CLAVE PUBLICA: "+CpubKey);
    console.log("ID_ANONIMA: "+id_anonim);
    //buscamos en la Urna_Bd si el usuario ha votado
    BallotBox.findOne({id_anomin: id_anonim}, function (err, voto) {
        if (err) {
            return res.status(500).json({message: `Error on the petition: ${err}`});
        }
        if (voto) {
            return res.status(400).send({message: "Ya has votado, Al carrer"})
        }
        else {
            //Verificamos la id_anonima con la Kpublica del censo
            Keys.findOne({keytype: "censo"}, function (err, key) {
                if (err) {
                    return res.status(500).send({message: `Error on the petition: ${err}`});
                }
                else {
                    CensoKey = key.publicKey;
                    console.log("CENSO KEYS: "+CensoKey);

                    var verID = id_anonim.powm(bignum(CensoKey.e), bignum(CensoKey.n));
                    console.log("ID: "+ verID);
                    console.log("PubKey_n: "+ CpubKey_n);
                    console.log(verID.toString() == CpubKey_n.toString());
                    if(verID.toString() == CpubKey_n.toString()){
                        console.log("ID VÁLIDA");

                        // VERIFICAR EL VOTO esta firmado por le usuario de la identidad anonima
                        var voto_verify = bignum(votoencrip_firmado).powm(CpubKey_e, verID.toString());
                        console.log("Verificacion del voto: "+ voto_verify.toString());

                        //VERIFICAR EL VOTO TIENE FORMATO CORRECTO Y NO ME LO HAN CAMBIADO
                        //VERIFICAR EL HASHHHHHH


                        //GUARDAR EN LA BASE DE DATOS:

                        var save_voto = new BallotBox ({
                            voto: voto_verify.toString(), // VOTO ENCRIPTADO
                            id_anomin: id_anonim.toString(), //ID ANONIMA
                            //hash_voto: String,
                            firma_voto : votoencrip_firmado.toString() // VOTO ENCRIPTADO Y FIRMADO CON LA PRIVADA DEL USER
                        });

                        save_voto.save(function (err) {
                            if(err) {
                                console.log(err);
                                return res.status(500).send({message:"Server error"});
                            }
                            return res.status(200).send({message:"VOTO EN LA URNA"});
                        })
                        var num;

                        BallotBox.find(function (err,ballotbox) {
                            if(err){
                                return res.status(500).send({message:"Server error"});
                            }
                            num = ballotbox.numOfVotes+1;
                            BallotBox.update({numOfVotes: num },function (err) {
                                if(err){
                                    return res.status(500).send({message:"Server error"});
                                }
                            });
                        });
                    }
                    else{
                        return res.status(400).send({message: "ID Anónima no valida"});

                    }
                }
            })
        }
    });

    //si lo es desencriptamos con la publica del usuario
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
    openBox,
    getKeysPaillier
};
