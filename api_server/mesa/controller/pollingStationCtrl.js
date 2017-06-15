/**
 * Created by VictorMiranda on 03/02/2017.
 */
var $ = require('jquery');
const PollingStation = require('../model/pollingStationModel');
const BallotBox = require('../../urna/model/SchemaBallotBox');
const Keys = require('../../model/SchemaKeys');
const service = require('../../services');
const secrets = require('secrets.js');
const Election = require('../../elections/model/SchemaElection');
const KeysPaillier = require('../../model/SchemaKeysPaillier');
const bignum = require('bignum');

var info = {};

function getKeys(req, res) {
    KeysPaillier.findOne({keytype: "melectoral"}, function (err, key) {
        if (err) {
            return res.status(500).send({message: `Error on the petition: ${err}`});
        }
        if (!key) {
            return res.status(404).send({message: `Key does not exist`});
        }
        else {
            res.status(200).send({publicKey: key.publicKey});
        }
    })
}

function sharedkeys(req, res) {

    var kshared = req.body;
    console.log(req.body);
    KeysPaillier.findOne({keytype: "melectoral"}, function (err, key) {
        if (err) {
            return res.status(500).send({message: `Error on the petition: ${err}`});
        }
        if (!key) {
            return res.status(404).send({message: `Key does not exist`});
        }
        else {
            var comb = secrets.combine(kshared.slice(0, 3));
            console.log("The combination of 3 of 4 is correct?");
            var privatePaillierShares = key.privateKey.lambda + "f" + key.privateKey.mu;
            console.log(comb.toString());
            console.log(privatePaillierShares.toString())
            console.log("Las Claves son correctas?");
            console.log(comb === privatePaillierShares.toString());
            if (comb === privatePaillierShares.toString()) {
                var election = {
                    enabled: false
                }
                var comb_split = privatePaillierShares.toString().split("f");
                var lambda = comb_split[0];
                var mu = comb_split[1];
                console.log(lambda + "    " + mu);
                privatePaillierShares = null;

                Election.update(election, function (err, user) {
                    if (err) {
                        console.log(err);
                        return res.status(500).json("Server error");
                    }
                    else {
                        res.status(200).send({message: "EMPEZANDO EL RECUENTO..."});

                        Results();

                        //return resultados;
                    }
                });
            }
            else {
                return res.status(400).send({message: "Claves erróneas"});
            }
        }
    })


}


function Results() {

    var results = {};
    console.log("HOLAAA");

 //  votos3 = [13039287935];

   // var prueba2 = countVotes(votos3, 1, 126869, 53022, 31536, 4);

   //console.log(prueba2);

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

        console.log ("RESULTADOS: " + resultados);

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

    var votos = {};
    var allvots = [];
    var num_votes = 0;
    var n = 0;
    var mu = 0;
    var lambda = 0;
    var ballotBox = {};
    var num_parties = 0;

    BallotBox.find(function (err, response) {
        if (err) {
            return res.send(err);
        }
        else {
            ballotBox = response;
            //console.log(ballotBox);

            votos = ballotBox;
            console.log("Votos: " + votos);
            ballotBox.forEach(function(vote){
                allvots.push(vote.voto)
                console.log("Votos: " + vote.voto);
            });
            /*for(var i=0; i<=votos.length;i++){
                allvots = votos[i].voto;
            }*/
            console.log(allvots);
            num_votes = allvots.length;
            console.log("NUMERO DE VOTOS: " + num_votes);

            KeysPaillier.findOne({keytype: "melectoral"}, function (err, key) {
                n = key.publicKey.n;
                lambda = key.privateKey.lambda
                mu = key.privateKey.mu;


                Election.find(function (err, election) {
                    if (err) {
                        return res.send(err);
                    }
                    else {
                        num_parties = election[0].parties.length;
                        console.log("Numero de partidos politicos: "+num_parties);
                      results = countVotes(allvots, num_votes, n, mu, lambda, num_parties);
                        //var votoooo =["15412087709011946322601518194263795303594176119958391370440626351972465608430888131117479030538633614358213629882456491784498301396208939065862373136920457378355894086987624538617841588384966925601521497106797512810232267597388381902936767154572805645269120822390765874259848773974726399237286601190662754644489846885054503406122264669727161204773311248762926276304932827716076575513190510791146044222891935303457416706164985641813522182683635596932301467410222406558222226140265570369658286112488259339742405469414187467228182894542298952631126149615299247031848972214807589524541248688352733910994395403877013091436"];
                        //results = countVotes(votoooo, num_votes, n, mu, lambda, num_parties);
                        info = {
                            results,
                            votos
                        };
                        console.log(info.results);
                        //return res.status(200).send(info);

                    }
                })
            });
        }
    });
};
function getResults() {
    return res.status(200).send(info);
}

function getResults2(req, res) {

    var voting_ended;
    var results = {};

    PollingStation.find(
        {name: req.params.name},
        function (err, station) {
            if (err) {
                return null;
            }
            console.log(station.active);
            voting_ended = station.active;
        }
    );

    function countVotes(votos, nvotos, n, mu, lambda, npartidos) {
        /*
         http://security.hsr.ch/msevote/seminar-papers/HS09_Homomorphic_Tallying_with_Paillier.pdf
         */

        var producto = 1;
        var n2 = bignum(n).pown(2);

        for (var i = 0; i < nvotos; i++) {
            producto = producto * votos[i];
        }

        var tally = bignum(producto).mod(n2);
        var resultado_f1 = bignum(tally).pown(lambda, n2);
        var resultado_f2 = bignum(resultado_f1).sub(1).div(n);
        var resultados = bignum(resultado_f2).mul(mu).mod(n).toNumber();

        var resultado = {};

        for (var i = 1; i <= npartidos; i++) {

            resultado[i + 'partido'] = Math.floor((resultados / Math.pow(10, npartidos - 1)) % 10);
        }

        /*var resultado = {
         '1partido' : Math.floor((resultados / 1) % 10),
         '2partido' : Math.floor((resultados / 10) % 10),
         '3partido' : Math.floor((resultados / 100) % 10),
         '4partido' : Math.floor((resultados / 1000) % 10)
         };*/

        console.log("RESULTADO RECUENTO: " + resultado);
        return resultado;

    }

    if (voting_ended) {
        var votes2 = {};
        var num_votes = 0;
        var n = 0;
        var mu = 0;
        var lambda = 0;
        var data = {};
        var num_parties2 = 0;

        BallotBox.find(function (err, response) {
            if (err)
                res.send(err);
            data = response;
            votes2 = data.votes;
            num_votes = data.numOfVotes;
            n = data.cipher.n;
            mu = data.cipher.mu;
            lambda = data.cipher.lambda;
            num_parties2 = data.num_parties;
        });

        results = countVotes(votes2, num_votes, n, mu, lambda, num_parties2);
        var info = {
            results,
            votes2
        }
        return res.status(200).send(info);
    }
    else {
        return res.status(403).send("La votació no ha acabat");
    }
}


function markVotingEnd(req, res) {
    PollingStation.update(
        {
            name: req.params.name
        },
        {$set: {active: false}},
        function (err) {
            if (err)
                res.send(err);
        });
}

function markVotingStart(req, res) {
    PollingStation.update(
        {
            name: req.body.name
        },
        {$set: {active: true}},
        function (err) {
            if (err) {
                res.send(err);
            }
        });

}

module.exports = {
    getKeys,
    getResults,
    markVotingEnd,
    markVotingStart,
    sharedkeys
};
