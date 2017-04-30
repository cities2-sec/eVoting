//var bigInt = require('biginteger.min');

bigInt.prime = function (bitLength) {
    var rnd = bigInt.zero;
    var isPrime = false;
    var two = new bigInt(2);

    while (!isPrime) {
        rnd = bigInt.randBetween(two.pow(bitLength - 1), two.pow(bitLength));
        if (rnd.isProbablePrime()) {
            isPrime = true;
        }
    }
    return new bigInt(rnd);
};

bigInt.eGcd = function (a, b) {
    // Take positive integers a, b as input, and return a triple (g, x, y), such that ax + by = g = gcd(a, b).
    var x = bigInt.zero;
    var y = bigInt.one;
    var u = bigInt.one;
    var v = bigInt.zero;

    while (a.notEquals(bigInt.zero)) {
        var modDiv = b.divmod(a);
        var q = modDiv.quotient;
        var r = modDiv.remainder;
        var m = x.minus(u.multiply(q));
        var n = y.minus(v.multiply(q));
        b = a;
        a = r;
        x = u;
        y = v;
        u = m;
        v = n;
    }
    return {
        b: b,
        x: x,
        y: y
    }
};

bigInt.modInv = function (a, n) {
    var egcd = this.eGcd(a, n);
    if (egcd.b.notEquals(bigInt.one)) {
        return null; // modular inverse does not exist
    } else {
        var ret = egcd.x.mod(n);
        if (ret.isNegative()) {
            ret = ret.add(n);
        }
        return ret;
    }
};

//module.exports = bigInt;
