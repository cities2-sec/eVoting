const mongoose = require('mongoose');
const schema = mongoose.Schema;

//Esquema de las claves privadas y publicas Solo para el censo electoral de momento
const KeysPaillierSchema =  new schema({
	keytype: {type: String, unique: true },
    publicKey: {
        n: String,
        n2:String,
        beta:String,
        alfa:String,
        g:String,
        bits:String
    },
    privateKey: {
        lambda: String,
        pubkey: String,
        mu: String,
        u: String,
        publicKey: {
            e: String,
            n: String,
            n2:String,
            beta:String,
            alfa:String,
            g:String,
            bits: String
        }
    }
});

module.exports = mongoose.model('KeysPaillier', KeysPaillierSchema);
