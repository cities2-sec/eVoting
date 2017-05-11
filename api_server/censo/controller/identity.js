const rsa = require('../../module/rsa');
const User = require('../model/SchemaUser');

function identityRequest(req, res) {
    var body = req.body;
    if(!body.msgid || !body.msg) {
        // no vale
        return res.status(400).send("No msgid or msg");
    }
    console.log("Req user: "+req.user);

    switch(body.msgid) {
        case 0:
            // Si es el primer mensaje, el censo revisa que no se le haya dado ya una identidad anonima
            if(req.user.identityGivenDate) {
                // Al usuario ya se la ha dado una identidad anonima
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
                            res.send(200).json(signedMsg);
                    });

                }
                else {
                    return res.status(500).json("No keys found");
                }
            });

            break;
        case 1:
            break;
        case 2:
            break;
        default:
            res.status(400).json("Unrecognized msg id");
    }
}

module.exports = {
    identityRequest
}
