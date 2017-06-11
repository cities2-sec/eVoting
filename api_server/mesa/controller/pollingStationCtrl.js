/**
 * Created by VictorMiranda on 03/02/2017.
 */
var $ = require('jquery');
const PollingStation = require('../model/pollingStationModel');
const service = require('../../services');
var bignum = require('bignum');

function getKeys(res) {
    return res.json({keys: global.PollingStationKey});
}

function getResults(req, res) {

    var voting_ended;
    var votos = {};
    var results = {};
    var num_votos = 0;
    var n;
    var mu;
    var lambda;

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

    function countVotes(votos, nvotos, n, mu, lambda) {
        // Función para contar los votos
        // Tres partidos
        // Población de 10 personas

        /*
         http://security.hsr.ch/msevote/seminar-papers/HS09_Homomorphic_Tallying_with_Paillier.pdf
         */

        var producto = 1;
        var n2=bignum(n).pow(2);

        for (var i = 0; i < nvotos; i++) {
            producto = producto * votos[i];
        }

        var tally = bignum(producto).mod(n2);
        var resultado_f1 = bignum(tally).pown(lambda,n2);
        var resultado_f2 = bignum(resultado_f1).sub(1).div(n);
        var resultados = bignum(resultado_f2).mul(mu).mod(n).toNumber();

        var resultado = {
            '1partido' : Math.floor((resultados / 1) % 10),
            '2partido' : Math.floor((resultados / 10) % 10),
            '3partido' : Math.floor((resultados / 100) % 10),
            '4partido' : Math.floor((resultados / 1000) % 10)
        };

        return resultado;

    }

    if (voting_ended) {
        $.get(global.API + '/api/urna/open', function (data) {
            votos = data.votes;
            num_votos = data.numOfVotes;
            n = data.cipher.n;
            mu = data.cipher.mu;
            lambda = data.cipher.lambda;
        });
        results = countVotes(votos, num_votos, n, mu, lambda);
        return res.status(200).send(results);
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
    markVotingStart
};
