const jwt = require('jwt-simple');
const moment = require('moment');
const mongoose = require('mongoose');
const bignum = require('bignum');
const secrets = require('secrets.js');
const fs = require('fs');

/* Routes*/
const config = require('../../config');
const Keys = require('../model/SchemaKeys');
const KeysPaillier = require('../model/SchemaKeysPaillier');
const rsa = require('../module/rsa');
var paillier = require('../module/paillier');

function createKeys(req) {
    /* CENSO */
    Keys.findOne({keytype: req}, function (err, key) {
        if (err) {
            console.log(`ERROR: Petitions doesn't do: ${err}`);
            return;
        }
        if (key) {
            console.log(`Keys existed for ${req} `);
            return;
        }
        else {
            console.log(`ERROR: Doesn't exist the keys for ${req} `);
            var bitslength = config.bitslength;
            var keys = new rsa.generateKeys(bitslength);
            Keys.remove({keytype: req}, function (err, key) {
                if (err)
                    res.send(err);
            });
            var key = new Keys({
                keytype: req,
                publicKey: {
                    e: keys.publicKey.e,
                    n: keys.publicKey.n,
                    bits: keys.publicKey.bits,
                },
                privateKey: {
                    p: keys.privateKey.p,
                    q: keys.privateKey.q,
                    d: keys.privateKey.d,
                    phi: keys.privateKey.phi,
                    publicKey: {
                        e: keys.publicKey.e,
                        n: keys.publicKey.n,
                        bits: keys.publicKey.bits
                    }
                }
            });
            key.save(function (err, KeyStored) {
                if (err) {
                    console.log(`ERROR: Not saved in Database: ${err}`);
                    return;
                }
                else {
                    console.log(`Stored the keys for ${req}`);
                    return;
                }
            })
        }
    })
}


function createSecretSharing(req, callback){
  var bitslength = config.bitslength;
  console.log("\n*************SHARING KEYS*************");

    KeysPaillier.findOne({keytype: req}, function (err, key) {
      if (err) {
          console.log(`ERROR: Petitions doesn't do: ${err}`);
          callback(0);
      }
      if (key) {
          console.log(`Keys existed for ${req} `);
          callback(1);
      }
      else {
      //var keys = new rsa.generateKeys(bitslength);
          // var shares = secrets.share(keys.privateKey.p.toString(),4,3);
      var keysPaillier = paillier.generateKeys(bitslength);
      var privatePaillierShares = keysPaillier.privateKey.lambda+"f"+keysPaillier.privateKey.mu;
      console.log(privatePaillierShares);
      /*
      var binary_privatePaillierShares = "";
          for (i=0; i < privatePaillierShares.length; i++) {
              binary_privatePaillierShares +=privatePaillierShares[i].charCodeAt(0).toString(2) + "";
          }
      console.log("Binario: "+binary_privatePaillierShares);

      var hex_privatePaillierShares = parseInt(binary_privatePaillierShares, 2).toString(16);
      console.log("Hex: "+hex_privatePaillierShares);
      */
      var shares = secrets.share(privatePaillierShares.toString(),4,3);
      console.log(shares);
      console.log("*********************************************\n");

          var key = new KeysPaillier({
            keytype: req,
            publicKey: {
                n: keysPaillier.publicKey.n.toString(),
                n2:keysPaillier.publicKey.n2.toString(),
                beta:keysPaillier.publicKey.beta.toString(),
                alfa:keysPaillier.publicKey.alfa.toString(),
                g:keysPaillier.publicKey.g.toString(),
                bits: keysPaillier.publicKey.bits.toString()
            },
            privateKey: {
                lambda: keysPaillier.privateKey.lambda.toString(),
                //pubkey: keysPaillier.privateKey.pubkey.toString(),
                mu: keysPaillier.privateKey.mu.toString(),
                u: keysPaillier.privateKey.u.toString(),
                publicKey: {
                    n: keysPaillier.publicKey.n.toString(),
                    n2:keysPaillier.publicKey.n2.toString(),
                    beta:keysPaillier.publicKey.beta.toString(),
                    alfa:keysPaillier.publicKey.alfa.toString(),
                    g:keysPaillier.publicKey.g.toString(),
                    bits: keysPaillier.publicKey.bits.toString()
                }
            }
          });
          var keysPailler = null;

          key.save(function (err, KeyStored) {
              if (err) {
                  console.log(`ERROR: Not saved in Database: ${err}`);
                  callback(0);
              }
              else {
                  console.log(`Stored the keys for ${req}`);
                  callback(shares);
              }
          })

      }
  })

}

function createToken(user) {
    console.log("Create Token for " + user.username);
    const payload = {
        username: user.username,
        iat: moment().unix(), // Data token created
        exp: moment().add(14, 'days').unix() // Expired data
    }
    return jwt.encode(payload, config.SECRET_TOKEN);
}

function decodeToken(token) {
    const decoded = new Promise(function (resolve, reject) {
        try {
            payload = jwt.decode(token, config.SECRET_TOKEN);
            if (payload.exp <= moment().unix()) {
                resolve({
                    status: 401,
                    message: "Token expired"
                })
            }
            resolve(payload.username);
        }
        catch (err) {
            reject({
                status: 500,
                message: "Invalid Token"
            })
        }
    });
    return decoded;
}

module.exports = {
    createToken,
    decodeToken,
    createKeys,
    createSecretSharing
}
