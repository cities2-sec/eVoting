const Keys = require('../../model/SchemaKeys');
const rsa = require('../../module/rsa.js');
const mongoose = require('mongoose');
const bignum = require('bignum');

function getKey (req, res){
  Keys.findOne({ keytype: "censo" }, function (err, key){
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
    getKey
}
