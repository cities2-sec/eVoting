var bignum = require('bignum');
const rsa = require('../api_server/module/rsa');
const http = require('http');

var msg = "6485";
var censoPK = null;

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
        path: '/censo/identity/request',
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            'Content-Length': Buffer.byteLength(body),
            'Authorization': "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJIUzI1NiJ9.eyJ1c2VybmFtZSI6ImNzYW50aTIiLCJpYXQiOjE0OTUyMDIxNjMsImV4cCI6MTQ5NjQxMTc2M30.B0vQlhKy7TOs4HGRardygVYFwnl_ziKaVmrSEpBoEfo"
        }
    };


    var post_req = http.request(options, function (res) {
        if(res.statusCode !== 200) {
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
            var unsignedMsg = censoPK.verify(bignum(body.sign, 16));
            var unsignedMsgStr = unsignedMsg.toString(16);
            if(msg == unsignedMsgStr) {
                console.log("Firma verificada");
            }
            else {
                console.log("Firma incorrecta");
            }
        });
    });

    //post the data
    post_req.end(body);
}






