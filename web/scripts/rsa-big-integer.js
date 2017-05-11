var rsa = {
    publicKey: function (bits, n, e) {
        this.bits = bits;
        this.n = n;
        this.e = e;
    },
    privateKey: function (p, q, d, publicKey) {
        this.p = p;
        this.q = q;
        this.d = d;
        this.publicKey = publicKey;
    },
    generateKeys: function(bitlength) {
        var p, q, n, phi, e, d, keys = {};
        // if p and q are bitlength/2 long, n is then bitlength long
        this.bitlength = bitlength || 2048;

        console.log("Generating RSA keys of", this.bitlength, "bits");
        p = bigInt.prime(this.bitlength / 2 + 1);
        do {
            q = bigInt.prime(this.bitlength / 2);
        } while (q.compare(p) === 0);
        n = p.multiply(q);

        phi = p.subtract(1).multiply(q.subtract(1));

        e = bigInt(65537);
        d = bigInt.modInv(e, phi);

        keys.publicKey = new rsa.publicKey(this.bitlength, n, e);
        keys.privateKey = new rsa.privateKey(p, q, d, keys.publicKey);
        //console.log(keys.privateKey);
        return keys;
    }
};


rsa.publicKey.prototype = {
	encrypt: function(m) {
		return m.modPow(this.e, this.n);
	},
	verify: function(c) {
		return c.modPow(this.e, this.n);
	}
};

rsa.privateKey.prototype = {
	sign: function(m) {
		return m.modPow(this.d, this.publicKey.n);
	},
	decrypt: function(c) {
		return c.modPow(this.d, this.publicKey.n);
	}
};
