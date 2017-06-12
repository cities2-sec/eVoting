var bignum = require('bignum');
const rsa = require('../api_server/module/rsa');
const http = require('http');
var crypto = require('crypto');

var msg = "6485";
var censoPK = null;
var keys = rsa.generateKeys(512);

var options = {
    "method": "GET",
    "hostname": "localhost",
    "port": "8080",
    "path": "/censo/key",
    "headers": {
        "cache-control": "no-cache",
        "postman-token": "2238ca01-defe-c69f-83c1-257f4fa40575"
    }
};

var req = http.request(options, function (res) {
    var chunks = [];

    res.on("data", function (chunk) {
        chunks.push(chunk);
    });

    res.on("end", function () {
        var body = JSON.parse(Buffer.concat(chunks).toString());
        console.log(JSON.stringify(body));
        censoPK = new rsa.publicKey(body.publicKey.bits, body.publicKey.n, body.publicKey.e);
        identityRequest();
    });
});

req.end();


var identityRequest = function() {

    var body = JSON.stringify({
        "msgid": 1,
        "msg": msg
    });

    var options = {
        hostname: 'localhost',
        port: 8080,
        path: '/censo/identity/request2',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IjQ3OTE1Mzk4RyIsImlhdCI6MTQ5NzExMDc3OSwiZXhwIjoxNDk4MzIwMzc5fQ.EHKtq_IOxpMWOjaDDt2ibivXPnQHvK3duB5juV8kP8g"
        }
    };


    var post_req = http.request(options, function (res) {
        if(res.statusCode !== 200) {
            console.log("Status code: "+res.statusCode);
            console.log("Ya se ha solicitado una identidad con este token");
            return;
        }
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = JSON.parse(Buffer.concat(chunks).toString());
            console.log(JSON.stringify(body));

            var unsignedPo = censoPK.verify(bignum(body.Po, 16));

            var myPoString = body.src+"%"+body.dst+"%"+body.C;
            var hash = crypto.createHash('sha256');
            hash.update(myPoString);
            var myPoHash = hash.digest('base64');

            var PoHash = unsignedPo.toBuffer().toString('base64');
            console.log("PoHash: "+PoHash);
            console.log("myPoHash: "+myPoHash);
            if(PoHash == myPoHash) {
                console.log("Po verificado");
            }
            else{
                return;
            }

            var hash = crypto.createHash('sha256');
            var PrString = "B%A%"+body.C;
            console.log("PrString: "+PrString);
            hash.update(PrString);
            var PrHash = hash.digest('base64');
            console.log("Pr hash: "+PrHash);
            var signedPrHash = keys.privateKey.sign(bignum.fromBuffer(Buffer.from(PrHash, 'base64'))).toString(16);
            var msg2 = {
                "msgid": 2,
                "msg": {
                    "src": "B",
                    "dst": "A",
                    "Pr": signedPrHash,
                    "publicKey": {
                        "bits": keys.publicKey.bits,
                        "n": keys.publicKey.n.toString(16),
                        "e": keys.publicKey.e.toString(16)
                    }
                }
            }

            sendMsg2(msg2);


        });
    });

    //post the data
    post_req.end(body);
}

var sendMsg2 = function(msg) {
    var body = JSON.stringify(msg);

    var options = {
        hostname: 'localhost',
        port: 8080,
        path: '/censo/identity/request2',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6IjQ3OTE1Mzk4RyIsImlhdCI6MTQ5NzExMDc3OSwiZXhwIjoxNDk4MzIwMzc5fQ.EHKtq_IOxpMWOjaDDt2ibivXPnQHvK3duB5juV8kP8g"
        }
    };

    var post_req = http.request(options, function (res) {
        if(res.statusCode !== 200) {
            console.log("Error: "+res.statusCode);
            return;
        }
        var chunks = [];

        res.on("data", function (chunk) {
            chunks.push(chunk);
        });

        res.on("end", function () {
            var body = JSON.parse(Buffer.concat(chunks).toString());
            console.log("Clave: "+JSON.stringify(body));



        });
    });

    //post the data
    post_req.end(body);
}
