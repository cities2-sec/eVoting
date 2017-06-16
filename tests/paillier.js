const Keys = require('../api_server/model/SchemaKeys');
const bignum = require('bignum');
const mongoose = require('mongoose');
const config = require('../config');
const rsa = require('../api_server/module/rsa');
const KeysPaillier = require('../api_server/model/SchemaKeysPaillier');

console.log("iniciando test");
//keys.createKeys("userTest");

mongoose.connect(config.db, function (err, res) {
    if (err) {
        return console.log(`ERROR: connecting to Database: ${err}`);
    }
    console.log('Connected to Database correctly!');

    start();

});


var start = function () {
    Keys.findOne({keytype: "userTest"}, function (err, key) {
        if (err) {
            console.log("Keys not found " + err);
        }
        if (key) {
            console.log("key userTest encontrada");
            var publicKey = new rsa.publicKey(key.publicKey.bits, key.publicKey.n, key.publicKey.e);
            var privateKey = new rsa.privateKey(key.privateKey.p, key.privateKey.q, key.privateKey.d, key.privateKey.phi, publicKey);

            Keys.findOne({keytype: "censo"}, function (err, keyCenso) {
                if (err) {
                    console.log("Keys not found " + err);
                }
                if (keyCenso) {
                    console.log("key censo encontrada");
                    //console.log("keyCenso.n: "+keyCenso.publicKey.n);
                    //var censoPublicKey = new rsa.publicKey(keyCenso.publicKey.bits, keyCenso.publicKey.n, keyCenso.publicKey.e);
                    //var censoPrivateKey = new rsa.privateKey(keyCenso.privateKey.p, keyCenso.privateKey.q, keyCenso.privateKey.d, keyCenso.privateKey.phi, publicKey);

                    //console.log(JSON.stringify(censoPrivateKey));
                    var bnum = bignum(2);
                    console.log(bnum.toString());

                     console.log("n: "+ keyCenso.publicKey.n);
                     console.log("e: "+ keyCenso.publicKey.e);

                     //var firma = bnum.powm(keyCenso.privateKey.d, keyCenso.publicKey.n);
                     //var desfirma = firma.powm(keyCenso.publicKey.e, keyCenso.publicKey.n);
                    var firma = bnum.powm(key.privateKey.d, key.publicKey.n);
                    var desfirma = firma.powm(key.publicKey.e, key.publicKey.n);
                     console.log("firma: "+firma);
                     console.log("desfirma: "+desfirma);



                    //console.log("Public Key N: "+ keyCenso.publicKey.n);
                    var nBN = bignum(key.publicKey.n);
                    var id_anonima = nBN.powm(keyCenso.privateKey.d, keyCenso.publicKey.n);
                    console.log("ID Anonima: " + id_anonima);
                    var id_anonima_validad = id_anonima.powm(keyCenso.publicKey.e, keyCenso.publicKey.n);
                    console.log("ID Anonima validada: " + id_anonima_validad);
                    if (nBN.toString(16) == id_anonima_validad.toString(16)) {
                        console.log("identidad anonima verificada");


                        KeysPaillier.findOne({keytype: "melectoral"}, function (err, keyMesa) {
                            if (err) {
                                console.log("Keys not found " + err);
                            }
                            if (keyMesa) {
                                var voto = 100; //1 100 10000
                                var rand = generateR(keyMesa.publicKey.n);

                                console.log(keyMesa.publicKey.n+"            "+keyMesa.publicKey.g)

                                var voto_encriptado = bignum(111111111111111111111111111111);

                                //var voto_encriptado = bignum(encryptPubkeyPaillier(voto, rand, keyMesa.publicKey.n, keyMesa.publicKey.g));
                                console.log("Voto encriptado: " + voto_encriptado);



                                var VotoEncriptadoFirmar = bignum(voto_encriptado).powm(key.privateKey.d, key.publicKey.n); //m^d x r mod n
                                console.log("Voto Encriptadofirmado:"+VotoEncriptadoFirmar.toString());

                                var voto_verify = bignum(VotoEncriptadoFirmar).powm(key.publicKey.e, key.publicKey.n);
                                console.log("Voto Verificado igual a encriptado: "+voto_verify);


                                console.log("N: "+ key.publicKey.n);
                                console.log("E: "+ key.publicKey.e);
                                console.log("D: "+ key.privateKey.d);
                                votar(keyMesa, id_anonima, voto_encriptado, VotoEncriptadoFirmar, key.publicKey.n, key.publicKey.e);
                            }
                        });
                    }
                    else
                        {
                            console.log("id anonima no valida");
                        }
                    }

                }
                );

        }

    });
}

var votar = function (keyMesa, id, voto_encriptado, voto_encriptado_firmado, public_n, public_e) {

    var voto_verify = voto_encriptado_firmado.powm(public_e, public_n);
    console.log(voto_encriptado_firmado+"                "+voto_verify)

    if (voto_encriptado.toString() == voto_verify.toString()) {

        var votos = [voto_verify];
        countVotes(votos,1,keyMesa.publicKey.n,keyMesa.privateKey.mu,keyMesa.privateKey.lambda,3);
    }
    else{
        console.log("No verify");
    }

};

var cipher = encryptPubkeyPaillier(10, 35145, 126869, 6497955158);

console.log("RESULTADO VOTO c_i:" + cipher);

function encryptPubkeyPaillier(m, r, n, g) {
    console.log("m: " + m);
    var n2 = bignum(n).pow(2);

    // return    (bigInt(g).modPow(m, n2)).multiply(r.modPow(n, n2)).mod(n2);
    return (bignum(g).mod(bignum(m))).mul(bignum(r).powm(bignum(n), bignum(n2)));
}
function generateR(n) {
    var r;
    do
    {
        r = bignum.rand(n);
    }
    while (bignum(r).cmp(n) >= 0 || bignum.gcd(r, bignum(n).pow(2)) != 1);
    return r;
}

function countVotes(votos, nvotos, n, mu, lambda, npartidos) {
    /*
     http://security.hsr.ch/msevote/seminar-papers/HS09_Homomorphic_Tallying_with_Paillier.pdf
     */


    var producto = 1;
    var n2 = bignum(n).pow(2);

    console.log(votos[0]);
    console.log(n);
    console.log(mu);
    console.log(lambda);
    console.log(bignum(mu).invertm(n));


    for (var i = 0; i < nvotos; i++) {
        console.log("Votante " + i + " " + votos[i]);
        producto = bignum(producto).mul(bignum(votos[i]));
    }

    console.log(producto);

    var tally = bignum(producto).mod(n2);

    console.log("N: " + n);
    console.log("N^2: " + n2);

    var resultado_f1 = bignum(tally).powm(lambda, n2);
    var resultado_f2 = (bignum(resultado_f1).sub(1)).div(n);
    var resultados = bignum(resultado_f2).mul(mu).mod(n);

    console.log("RESULTADOS: " + resultados);

    var resultado = {};

    for (var i = 1; i <= npartidos; i++) {

        resultado[i + 'partido'] = Math.floor((resultados / Math.pow(10, i - 1)) % 10);
    }

    /*var resultado = {
     '1partido' : Math.floor((resultados / 1) % 10),
     '2partido' : Math.floor((resultados / 10) % 10),
     '3partido' : Math.floor((resultados / 100) % 10),
     '4partido' : Math.floor((resultados / 1000) % 10)
     };*/

    return resultado;

}



