

function lcm(a,b) {
    this.p = bigInt(a);
    this.q = bigInt(b);
    return this.p.multiply(this.q).divide(this.p.gcd(this.q));
}

var paillier = {
    publicKey: function(bits, n) {
        this.bits = bits;
        this.n = n;
        this.n2 = this.n.pow(2);
        this.beta = bigInt.rand(this.n);
        this.alfa = bigInt.rand(this.n);
        this.g = this.alfa.multiply(this.n).add(1).mod(this.n2).multiply(this.beta.modPow(this.n,this.n2)).mod(this.n2);
    },
    privateKey: function(lambda,pubkey) {
        this.lambda = lambda;
        this.pubkey = pubkey;
        this.mu = this.pubkey.g.modPow(this.lambda,this.pubkey.n2).subtract(1).divide(this.pubkey.n);
        this.u = bigInt(this.mu).modInv(pubkey.n);

    },
    generateKeys: function(modulusbits) {
        var p, q, n,random, keys = {};
        this.bitlength = modulusbits || 2048;
        console.log("Generando PAILLIER Keys Elecciones de", this.bitlength, "bits");
        p = bigInt.prime(this.bitlength / 2);
        do {
            q = bigInt.prime(this.bitlength / 2);
        } while (q.compare(p) === 0 && q.gcd(p)===1);

        n = p.multiply(q);
        keys.publicKey = new paillier.publicKey(this.bitlength,n);

        //λ = lcm(p − 1, q − 1)
        lambda = lcm(p.subtract(1),q.subtract(1));
        keys.privateKey = new paillier.privateKey(lambda,keys.publicKey);

        return keys;
    }
};

paillier.publicKey.prototype = {
    //c = g^m · r^n mod n^2
    encrypt: function(m,r) {
        // return  this.g.powm(m,this.n2).mul(r.powm(this.n,this.n2)).mod(this.n2);
    }
};

paillier.privateKey.prototype = {
    encrypt: function(m) {
        return m.modPow(this.publicKey.e, this.publicKey.n);
    },
    verify: function(c) {
        return c.modPow(this.publicKey.e, this.publicKey.n);
    },
    sign: function(m) {
        return m.modPow(this.d, this.publicKey.n);
    },
    decrypt: function(c) {
        console.log("desencriptando...");
        return c.modPow(this.lambda,this.pubkey.n2).subtract(1).divide(this.pubkey.n).mod(this.pubkey.n).multiply(this.u).mod(this.pubkey.n);
    }

};
//module.exports = paillier;

