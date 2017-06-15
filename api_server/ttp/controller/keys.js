const TtpKeys = require('../model/SchemaTtpKey.js');
const mongoose = require('mongoose');
const crypto = require('crypto');
const Keys = require('../../model/SchemaKeys');
const bignum = require('bignum');


function getKey (req, res) {
    var body = req.body;
    if(!body.username) {
        // no vale
        return res.status(400).json("No username");
    }
    TtpKeys.findOne({ username: body.username} , function (err, key) {
        if(err) {
            console.log(err);
            return res.status(500).json("Server error");
        }
        if(!key) {
            return res.status(400).json("Key not found");
        }
        res.status(200).json(key);

    });
}

function postKey (req, res) {
    var body = req.body;
    if(!body.username || !body.key) {
        // no vale
        return res.status(400).json("No username or key");
    }


    const key = new TtpKeys({
        username: body.username,
        key: body.key
    });

    TtpKeys.findOneAndUpdate({username: key.username}, {key: key.key}, {upsert:true}, function(error, result) {
        if (error) {
            console.log("[TTP] Error al buscar key")
            return res.status(500).send("Server error");
        }
        if(!result) {
            console.log("[TTP] Clave creada");
            return res.status(200).send(key);
        }
        else {
            console.log("[TTP] Clave actualizada");

            // Crear proof of publication

            var PkpString = "TTP%A%B%"+body.key;
            var hash = crypto.createHash('sha256');
            hash.update(PkpString);
            var PkpHash = hash.digest('hex');
            //var PkpHash = crypto.createHash('sha256').update(PkpString).digest('base64');
            console.log("PkpHash: "+PkpHash);
            Keys.findOne({ keytype: "ttp" } , function (err, ttpKeys) {
                if (err) {
                    console.log("Keys not found " + err);
                    return res.status(500).json("Server error");
                }
                if (ttpKeys) {
                    var publicKey = new rsa.publicKey(ttpKeys.publicKey.bits, ttpKeys.publicKey.n, ttpKeys.publicKey.e);
                    var privateKey = new rsa.privateKey(ttpKeys.privateKey.p, ttpKeys.privateKey.q, ttpKeys.privateKey.d, ttpKeys.privateKey.phi, publicKey);
                    //var unsignedPkp = bignum(PkpHash, 16);
                    //console.log("unsignedPkp: "+unsignedPkp.toString());
                    var Pkp = privateKey.sign(bignum.fromBuffer(Buffer.from(PkpHash, 'hex')));
                    console.log("Pkp: "+Pkp.toString(16));
                    var response = {
                        "key": key,
                        "Pkp": Pkp.toString(16)
                    }
                    return res.status(200).send(JSON.stringify(response));
                }
            });


        }
    });
}

function getTtpKeys (req, res) {
    Keys.findOne({ keytype: "ttp" }, function (err, key){
        if(err){
            return res.status(500).send({message: `Error on the petition: ${err}`});
        }
        if(!key){
            return res.status(404).send({message: `Key does not exist`});
        }
        else{
            res.status(200).send({publicKey : key.publicKey});
        }
    })
}



module.exports = {
    getKey,
    postKey,
    getTtpKeys
}
