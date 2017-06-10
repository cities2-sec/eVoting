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
    key.save(function (err, key) {
        if(err) {
            console.log(err);
            return res.status(500).send("Server error");
        }
        return res.status(200).send(key);
    })
}

module.exports = {
    getKey,
    postKey
}
