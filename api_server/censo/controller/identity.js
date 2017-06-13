const rsa = require('../../module/rsa');
const User = require('../model/SchemaUser');
const mongoose = require('mongoose');
const Keys = require('../../model/SchemaKeys');
const moment = require('moment');
const bignum = require('bignum');
const crypto = require('crypto');
const aesjs = require('aes-js');
const http = require('http');
const config = require('../../../config');


var sessions = [];

function identityRequest(req, res) {
    var body = req.body;
    console.log(req.body);
    if(!body.signid || !body._id) {
        return res.status(400).json({message: "Wrong Data"});
    }
    User.findOne({ _id: req.body._id }, function(err, user){
      if(err){
          return res.status(500).json({message: `Error on the petition: ${err}`});
      }
      if (!user){
          return res.status(404).send({message: "User doesn't exists"})
      }
      if(user){
        if(user.identityGivenDate){
          return res.status(403).json({message:"You already have an anonymous identity", anonim_id: user.anonim_id});
        }
        else{
          Keys.findOne({ keytype: "censo" } , function (err, key) {
              if (err) {
                  console.log("Keys not found "+err);
                  return res.status(500).json("Server error");
              }
              if (key) {
                  // A partir de los datos de la BD creo keys
                  var publicKey = new rsa.publicKey(key.publicKey.bits, key.publicKey.n, key.publicKey.e);
                  var privateKey = new rsa.privateKey(key.privateKey.p, key.privateKey.q, key.privateKey.d, key.privateKey.phi, publicKey);

                  // Firma la identidad
                  console.log("signid: " +bignum(body.signid,16));
                  console.log("signid_2: " +parseInt(body.signid,16))
                  var signedMsg = privateKey.sign(bignum(body.signid, 16)).toString(16);
                  console.log("signedMsg: "+ signedMsg)

                  // Por último intentamos actualizar el usuario para saber que le hemos dado indentidad
                  var user_update = {
                    identityGivenDate: Date.now(),
                    anonim_id: signedMsg,
                  }

                  User.update({_id: req.body._id}, user_update,function(err, user){
                          if(err) {
                              console.log(err);
                              return res.status(500).json("Server error");
                          }
                          else{
                            User.findOne({_id:req.body._id}, function(err,user){
                              if(err) {
                                  console.log(err);
                                  return res.status(500).json("Server error");
                              }
                              else{
                                res.status(200).send({anonim_id: signedMsg, identityGivenDate: user.identityGivenDate});
                              }
                            })

                          }
/*
                          // Creo un objeto de sesión para guardar las cosas que necesitos durante todo el diálogo
                          var currentSession = {
                              "username": req.user.username
                          }
                          // Empiezo el no repudio enviando el primer mensaje
                          startNonRepudiation("hola", privateKey, res, currentSession);
*/
                  });

              }
              else {
                  return res.status(500).json("No keys found");
              }
          });
      }
    }
  })
}

function identityRequestNR(req, res) {
    var body = req.body;
    switch(body.msgid) {
        case 1:
            // Si es el primer mensaje, el censo revisa que no se le haya dado ya una identidad anonima
            /*
            if(req.user.identityGivenDate) {
                return res.status(403).json("You already have an anonymous identity");
            }*/
            // Firmar identidad

            // Obtener keys de la BD
            Keys.findOne({ keytype: "censo" } , function (err, key) {
                if (err) {
                    console.log("Keys not found "+err);
                    return res.status(500).json("Server error");
                }
                if (key) {
                    // A partir de los datos de la BD creo keys
                    var publicKey = new rsa.publicKey(key.publicKey.bits, key.publicKey.n, key.publicKey.e);
                    var privateKey = new rsa.privateKey(key.privateKey.p, key.privateKey.q, key.privateKey.d, key.privateKey.phi, publicKey);

                    // Firma la identidad
                    var signedMsg = privateKey.sign(bignum(body.msg, 16)).toString(16);

                    removeSessionFromUsername(req.user.username);
                    // Creo un objeto de sesión para guardar las cosas que necesitos durante todo el diálogo
                    var currentSession = {
                        "username": req.user.username,
                        "signedID": signedMsg
                    }
                    // Empiezo el no repudio enviando el primer mensaje
                    startNR(signedMsg, privateKey, res, currentSession);
                }
                else {
                    return res.status(500).json("No keys found");
                }
            });

            break;
        case 2:
            processNRMsg2(body.msg, {}, res, getSessionFromUsername(req.user.username));
            break;
        default:
            res.status(400).json("Unrecognized msg id");
    }
}

function startNR(msg, privateKey, res, currentSession) {
  //generar una clave simétrica
  var keyBuf = crypto.randomBytes(16);
  //var ivBuf = crypto.randomBytes(16);
  //var key = keyBuf.toString(outputEncoding)+"."+ivBuf.toString(outputEncoding);
  var key = keyBuf.toString('hex');

  //enciptamos el mensaje con la clave generada
  console.log("Encriptando: "+msg);
  console.log("Con key: "+keyBuf.toString('hex'));
  //console.log("Y IV: "+ivBuf.toString('hex'));
  //var cipher = crypto.createCipher(algorithm, keyBuf, ivBuf);
  //var ciphered = CryptoJS.AES.encrypt(msg, keyBuf.toString('hex')).toString();
  //var ciphered = cipher.update(msg, inputEncoding, outputEncoding);
  //ciphered += cipher.final(outputEncoding);

  var aesCtr = new aesjs.ModeOfOperation.ctr(keyBuf);
  var cipheredBytes = aesCtr.encrypt(aesjs.utils.hex.toBytes(msg));
  var ciphered = aesjs.utils.hex.fromBytes(cipheredBytes);
  console.log("Resultado: "+ciphered);

  //Generamos el hash del proof of origin
  var PoString = "A%B%"+ciphered;
  var hash = crypto.createHash('sha256');
  hash.update(PoString);
  var PoHash = hash.digest('base64');
  //Firmamos el Po
  var signedPoHash = privateKey.sign(bignum.fromBuffer(Buffer.from(PoHash, 'base64'))).toString(16);

  //Mensaje con todos los campos necesarios
  var msg1 = {
    "src": "A",
    "dst": "B",
    "C": ciphered,
    "Po": signedPoHash
  }

  // Me guardo la C y la key para poder comprobar el Pr en el mensaje que me devolverá
  currentSession.C = ciphered;
  currentSession.key = key;

  //Lo guardo en una variable de scope de todo el documento
  sessions.push(currentSession);
  console.log(JSON.stringify(msg1));
  res.status(200).json(msg1);
}

function processNRMsg2(msg, privateKey, finalRes, currentSession) {
  console.log(JSON.stringify(msg));
  // Genero la public key a partir de los datos que ha enviado
  var publicKey = new rsa.publicKey(msg.publicKey.bits, bignum(msg.publicKey.n, 16), bignum(msg.publicKey.e, 16));
  console.log(parseInt(msg.publicKey.n, 16));
  // El Pr viene firmado, así que compruebo la firma
  var signedPr = bignum(msg.Pr, 16);
  console.log("signedPr: "+signedPr);
  var unsignedPr = publicKey.verify(bignum(msg.Pr, 16));
  console.log("unsignedPr: "+unsignedPr);
  var PrHash = unsignedPr.toString(16);
  console.log("PrHash: "+PrHash);
  // Una vez tengo el hash del Pr recibido, genero otro para compararlos
  var myPrString = msg.src+"%"+msg.dst+"%"+currentSession.C;
  console.log("myPrString: "+myPrString);
  var hash = crypto.createHash('sha256');
  hash.update(myPrString);
  var myPrHash = hash.digest('hex');


  console.log("myPrHash: "+myPrHash);
  // Comparo el hash recibido y el generado por mi
  if(PrHash == myPrHash) {
      console.log("Pr verificado");
  }
  else{
      console.log("Pr no verificado");
      //return;
  }

  //Falta continuar enviando los datos a la ttp
    var body = JSON.stringify({
        "username": currentSession.username,
        "key": currentSession.key
    });

    var options = {
        hostname: config.ip,
        port: config.port,
        path: '/ttp',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImNzYW50aTIiLCJpYXQiOjE0OTUyMDIxNjMsImV4cCI6MTQ5NjQxMTc2M30.B0vQlhKy7TOs4HGRardygVYFwnl_ziKaVmrSEpBoEfo"
        }
    };

    var post_req = http.request(options, function (res) {
        if(res.statusCode !== 200) {
            console.log("Error al publicar key");
            return;
        }
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = JSON.parse(Buffer.concat(chunks).toString());
            console.log(JSON.stringify(body));

            console.log("Clave publicada en la ttp");

            // Por último intentamos actualizar el usuario para saber que le hemos dado indentidad
            User.update({
                    username: currentSession.username
                }, {
                    identityGivenDate: Date.now(),
                    anonim_id: currentSession.signedID,
                },
                function(err, user){
                    if(err) {
                        console.log(err);
                        return res.status(500).json("Server error");
                    }
                    return finalRes.status(200).send(body);

                });


        });
    });

    post_req.end(body);
}

// Esta función busca en la lista de sesiones la correspondiente al usuario pasado por parámetros
var getSessionFromUsername = function(username) {
  for(var i = 0; i<sessions.length; i++) {
      if(sessions[i].username == username) {
          return sessions[i];
      }
  }
  return {};
}

var removeSessionFromUsername = function(username) {
    for(var i = 0; i<sessions.length; i++) {
        if(sessions[i].username = username) {
            sessions.splice(i,1);
            return;
        }
    }
}

module.exports = {
  identityRequest,
  identityRequestNR
}
