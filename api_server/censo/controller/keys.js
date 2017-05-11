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
      return res.status(404).send({message: `Error on the petition: ${err}`});
    }
    else{
      res.status(200).send({publicKey : key.publicKey});
    }
  })
}

/*exports.encrypt = function (req, res) {
    console.log('req', req.body.result);
    console.log(keys);
		var m = bignum(req.body.result);
		console.log(keys.privateKey.publicKey.n.toString())
		d = keys.privateKey.decrypt(m);
		//var d = m.powm(e, n);
		console.log("Decrypted d :" + d.toString());
}*/

module.exports = {
    getKey
}
