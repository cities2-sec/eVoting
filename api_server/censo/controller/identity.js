const rsa = require('../../module/rsa');
const User = require('../model/SchemaUser');
const mongoose = require('mongoose');
const Keys = require('../../model/SchemaKeys');
var bignum = require('bignum');
var crypto = require('crypto');


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
                  var signedMsg = privateKey.sign(bignum(body.signid, 16)).toString(16);

                  // Por último intentamos actualizar el usuario para saber que le hemos dado indentidad
                  var user_update = {
                    identityGivenDate: Date.now(),
                    anonim_id: signedMsg
                  }

                  User.update({_id: req.body._id}, user_update,function(err, user){
                          if(err) {
                              console.log(err);
                              return res.status(500).json("Server error");
                          }
                          else{
                            res.status(200).send({anonim_id: signedMsg});
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

    /*switch(body.msgid) {

        case 1:
            // Si es el primer mensaje, el censo revisa que no se le haya dado ya una identidad anonima
            if(req.user.identityGivenDate) {
                return res.status(403).json("You already have an anonymous identity");
            }

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

                    // Por último intentamos actualizar el usuario para saber que le hemos dado indentidad
                    User.update({
                            username: req.user.username
                        }, {
                            identityGivenDate: Date.now()
                        },
                        function(err, user){
                            if(err) {
                                console.log(err);
                                return res.status(500).json("Server error");
                            }

                            // Creo un objeto de sesión para guardar las cosas que necesitos durante todo el diálogo
                            var currentSession = {
                                "username": req.user.username
                            }
                            // Empiezo el no repudio enviando el primer mensaje
                            startNonRepudiation("hola", privateKey, res, currentSession);
                    });

                }
                else {
                    return res.status(500).json("No keys found");
                }
            });

            break;
        case 2:
            processMsg2(body.msg, {}, res, getSessionFromUsername(req.user.username));
            break;
        case 3:
            res.status(501).json();
            break;
        default:
            res.status(400).json("Unrecognized msg id");
    }
    */
}


function identityRequest2(req, res) {
  console.log('POST')
  console.log(req.body);
  Keys.findOne({ keytype: "censo" }, function (err, key){
    if(err){
      return res.status(500).send({message: `Error on the petition: ${err}`});
    }
    /*if(!key){
      return res.status(404).send({message: `Error on the petition: ${err}`});
    }*/
    else{

      var publicKey = new rsa.publicKey(key.publicKey.bits, key.publicKey.n, key.publicKey.e);
      var privateKey = new rsa.privateKey(key.privateKey.p, key.privateKey.q, key.privateKey.d, key.privateKey.phi, publicKey);

      var id = req.body.id;
      console.log(id);
      var signedMsg = privateKey.sign(id);
      res.status(200).send({ sign: signedMsg })
    }
  })
}

function startNonRepudiation(msg, privateKey, res, currentSession) {
  //generar una clave simétrica
  var algorithm = 'aes256';
  var inputEncoding = 'utf8';
  var keyBuf = crypto.randomBytes(256);
  var key = keyBuf.toString('base64');
  var outputEncoding = 'hex';

  //enciptamos el mensaje con la clave generada
  console.log("Cifrando msg: "+msg+" con altorigmo: "+algorithm+ " y clave: "+key);
  var cipher = crypto.createCipher(algorithm, key);
  var ciphered = cipher.update(msg, inputEncoding, outputEncoding);
  ciphered += cipher.final(outputEncoding);

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

  res.status(200).json(msg1);
}

function processMsg2(msg, privateKey, res, currentSession) {
  console.log(JSON.stringify(msg));
  // Genero la public key a partir de los datos que ha enviado
  var publicKey = new rsa.publicKey(msg.publicKey.bits, new bignum(msg.publicKey.n, 16), new bignum(msg.publicKey.e, 16));
  // El Pr viene firmado, así que compruebo la firma
  var unsignedPr = publicKey.verify(bignum(msg.Pr, 16));
  var PrHash = unsignedPr.toBuffer().toString('base64');

  // Una vez tengo el hash del Pr recibido, genero otro para compararlos
  var myPrString = msg.src+"%"+msg.dst+"%"+currentSession.C;
  console.log("myPrString: "+myPrString);
  var hash = crypto.createHash('sha256');
  hash.update(myPrString);
  var myPrHash = hash.digest('base64');

  console.log("PrHash: "+PrHash);
  console.log("myPrHash: "+myPrHash);
  // Comparo el hash recibido y el generado por mi
  if(PrHash == myPrHash) {
      console.log("Pr verificado");
  }
  else{
      return;
  }

  //Falta continuar enviando los datos a la ttp
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

module.exports = {
  identityRequest,
  identityRequest2
}
