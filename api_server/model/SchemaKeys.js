const mongoose = require('mongoose');
const schema = mongoose.Schema;

//Esquema de las claves privadas y publicas Solo para el censo electoral de momento
const KeysSchema =  new schema({
	keytype: {type: String, unique: true },
	publicKey:{
		e: String,
		n: String,
		bits: String,
	},
	privateKey:{
		p: String,
		q: String,
		d: String,
		phi: String,
		publicKey : {
			e: String,
			n: String,
			bits: String
		}
	}
});

module.exports = mongoose.model('Keys', KeysSchema);
