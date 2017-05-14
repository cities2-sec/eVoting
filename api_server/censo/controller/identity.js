const rsa = require('../../module/rsa');
const User = require('../model/SchemaUser');
const mongoose = require('mongoose');
const Keys = require('../../model/SchemaKeys');
var bignum = require('bignum');


function identityRequest(req, res) {
    var body = req.body;
    if(!body.msgid || !body.msg) {
        // no vale
        return res.status(400).json("No msgid or msg");
    }
    switch(body.msgid) {
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
                    var signedMsg = privateKey.sign(body.msg);

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
                            // Ha salido bien, enviamos la identidad firmada
                            // *** De momento no hacemos no repudio
                            //TODO: no repudio
                            res.status(200).json(signedMsg);
                    });

                }
                else {
                    return res.status(500).json("No keys found");
                }
            });

            break;
        case 2:
            res.status(501).json();
            break;
        case 3:
            res.status(501).json();
            break;
        default:
            res.status(400).json("Unrecognized msg id");
    }
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

/*function saveProduct (req, res) {
  console.log('POST /api/product')
  console.log(req.body)

  let product = new Product()
  product.name = req.body.name
  product.picture = req.body.picture
  product.price = req.body.price
  product.category = req.body.category
  product.description = req.body.description

  product.save((err, productStored) => {
    if (err) res.status(500).send({message: `Error al salvar en la base de datos: ${err} `})

    res.status(200).send({ product: productStored })
  })
}*/



module.exports = {
    identityRequest,
    identityRequest2
}
