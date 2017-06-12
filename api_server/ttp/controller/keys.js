const TtpKeys = require('../model/SchemaTtpKey.js');
const mongoose = require('mongoose');


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
            return res.status(200).send(key);
        }
    });
}

module.exports = {
    getKey,
    postKey
}
