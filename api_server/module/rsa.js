var bignum = require('bignum');

rsa = {
    publicKey: function(bits, n, e) {
        this.bits = bits;
        this.n = n;
        this.e = e;
    },
    privateKey: function(p, q, d, phi, publicKey) {
        this.p = p;
        this.q = q;
        this.d = d;
        this.phi = phi;
        this.publicKey = publicKey;
    },
    generateKeys: function(bitlength) {
        var p, q, n, phi, e, d, keys = {};
        this.bitlength =  bitlength || 512;
        console.log("Generating Keys...")
        p = bignum.prime(bitlength/2, safe = true);
        do {
            q = bignum.prime((bitlength/2)+1, safe = true);
        } while(q.cmp(p) === 0);
        n = p.mul(q);
        phi = p.sub(1).mul(q.sub(1));
        e = bignum("65537");
        d = e.invertm(phi);
        keys.publicKey = new rsa.publicKey(bitlength, n, e);
        keys.privateKey = new rsa.privateKey(p, q, d, phi, keys.publicKey);
        return keys;
    }
};

rsa.publicKey.prototype = {
    encrypt: function(m) {
        var mbig;
        if(!bignum.isBigNum(m)) {
            mbig = bignum(m);
        } else {
            mbig = m;
        }
        return mbig.powm(this.e, this.n);
    },
    verify: function(c) {
        var cbig;
        if(!bignum.isBigNum(c)) {
            cbig = bignum(c);
        } else {
            cbig = c;
        }
        return cbig.powm(this.e, this.n);
    },
}

rsa.privateKey.prototype = {
    encrypt: function(m) {
        var mbig;
        if(!bignum.isBigNum(m)) {
            mbig = bignum(m);
        } else {
            mbig = m;
        }
        return mbig.powm(this.publicKey.e, this.publicKey.n);
    },
    verify: function(c) {
        var cbig;
        if(!bignum.isBigNum(c)) {
            cbig = bignum(c);
        } else {
            cbig = c;
        }
        return cbig.powm(this.publicKey.e, this.publicKey.n);
    },
    decrypt: function(c) {
        var cbig;
        if(!bignum.isBigNum(c)){
            cbig = bignum(c);
        } else {
            cbig = c;
        }
        return cbig.powm(this.d, this.publicKey.n);
    },
    sign: function(m) {
        var mbig;
        if(!bignum.isBigNum(m)){
            mbig = bignum(m);
        } else {
            mbig = m;
        }
        return mbig.powm(this.d, this.publicKey.n);
    },
};

module.exports = rsa;
