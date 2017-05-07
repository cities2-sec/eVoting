const ip = require("ip");
module.exports = {
    ip: process.env.OPENSHIFT_NODEJS_IP || process.env.IP || ip.address() || localhost,
    port: process.env.PORT || 8080,
    secure_port : 8443,
    db: process.env.MONGODB || 'mongodb://localhost/evoting',
    SECRET_TOKEN: 'tokenproyect',
    bitslength : 128 || 1024 || 2048 // It must be more than 1028 o equal at least
}
