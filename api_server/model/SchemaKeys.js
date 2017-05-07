var mongoose = require('mongoose');

module.exports = mongoose.model('keysModel', {
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
