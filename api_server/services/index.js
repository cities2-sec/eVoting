
const jwt = require('jwt-simple');
const moment = require('moment');
const mongoose = require('mongoose');
const bignum = require('bignum');

/* Routes*/
const config =require('../../config');
const Keys = require('../model/SchemaKeys');
const rsa = require('../module/rsa');


function createKeys(req) {
	Keys.find({ keytype: req } , function (err, key){
			if(err) {
				console.log(`ERROR: Petitions doesn't do: ${err}`);
        return;
			}
			if(key){
        console.log(`Keys existed for ${req} `);
        return;
      }
      else{
        console.log(`ERROR: Doesn't exist the keys for ${req} `);
				var bitslength = config.bitslength;
				keys = new rsa.generateKeys(bitslength);

				Keys.remove({keytype : req}, function(err, key) {
					if (err)
						res.send(err);
					});

				var key = new Keys({
          keytype: req,
          publicKey:{
          	e:  keys.publicKey.e,
          	n: keys.publicKey.n,
          	bits:  keys.publicKey.bits,
          },
          privateKey:{
          	p: keys.privateKey.p,
          	q: keys.privateKey.q,
          	d: keys.privateKey.d,
          	phi: keys.privateKey.phi,
          	publicKey : {
              e:  keys.publicKey.e,
          		n: keys.publicKey.n,
          		bits:  keys.publicKey.bits
            }
          }
		    });
			    key.save(function (err, KeyStored) {
			        if(err) {
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

function createToken(user){
    console.log("Create Token for " + user.username);
    const payload = {
        sub: user._id,
        iat: moment().unix(), // Data token created
        exp: moment().add(14, 'days').unix() // Expired data
    }
    return jwt.encode(payload, config.SECRET_TOKEN);

}

function decodeToken(token){
    const decoded = new Promise(function (resolve, reject){
        try{
            payload = jwt.decode(token, config.SECRET_TOKEN)

            if(payload.exp <= moment().unix()){
                resolve({
                    status: 401,
                    message: "Token expired"
                })
            }
            resolve (payload.status);
        }
        catch(err){
            reject({
                status: 500,
                message: "Invalid Token"
            })
        }
    })
    return decoded;
}

module.exports = {
    createToken,
    decodeToken,
    createKeys
}
