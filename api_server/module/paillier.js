var bignum = require('bignum');

function lcm(a,b) {
    this.p = bignum(a);
    this.q = bignum(b);
    //this.p.mul(this.q);
    return this.p.mul(this.q).div(this.p.gcd(this.q));
}

paillier = {
    publicKey: function(bits, n) {
        this.bits = bits;
        //this.n = bignum(n);
        this.n = n;
        this.n2 = this.n.pow(2);
        this.beta = bignum.rand(this.n);
        this.alfa = bignum.rand(this.n);
        this.g = this.alfa.mul(this.n).add(1).mod(this.n2).mul(this.beta.powm(this.n,this.n2)).mod(this.n2);
    },
    privateKey: function(lambda,pubkey) {
        this.lambda = lambda;
        this.pubkey = pubkey;
        //μ = L(g^λ mod n^2 )^-1 . mod n
        //this.u = this.pubkey.n.div(this.pubkey.g.powm(this.lambda,this.pubkey.n2).sub(1)).mod(this.pubkey.n);
        this.mu = this.pubkey.g.powm(this.lambda,this.pubkey.n2).sub(1).div(this.pubkey.n);
        this.u = bignum(this.mu).invertm(pubkey.n);

    },
    generateKeys: function(modulusbits) {
        var p, q, n,random, keys = {};
        this.bitlength = modulusbits;
        console.log("Generando PAILLIER Keys Elecciones de", this.bitlength, "bits");
        p = bignum.prime(this.bitlength / 2);
        do {
            q = bignum.prime(this.bitlength / 2);
        } while (q.cmp(p) === 0 && q.gcd(p)==1);

        n = p.mul(q);
        keys.publicKey = new paillier.publicKey(this.bitlength,n);

        //λ = lcm(p − 1, q − 1)
        lambda = lcm(p.sub(1),q.sub(1));
        keys.privateKey = new paillier.privateKey(lambda,keys.publicKey);

        //console.log(keys);
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
        return m.powm(this.publicKey.e, this.publicKey.n);
    },
    verify: function(c) {
        return c.powm(this.publicKey.e, this.publicKey.n);
    },
    sign: function(m) {
        return m.powm(this.d, this.publicKey.n);
    },
    decrypt: function(c) {
        //this.g = this.alfa.mul(this.n).add(1).mod(this.n2).mul(this.beta.powm(this.n,this.n2)).mod(this.n2);
        console.log("desencriptando...");
        return c.powm(this.lambda,this.pubkey.n2).sub(1).div(this.pubkey.n).mod(this.pubkey.n).mul(this.u).mod(this.pubkey.n);
        //return c;
    }
};
module.exports = paillier;