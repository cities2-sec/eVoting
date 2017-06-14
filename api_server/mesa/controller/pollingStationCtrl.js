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

function getKeys(req,res) {
  KeysPaillier.findOne({ keytype: "melectoral" }, function (err, key){
    if(err){
      return res.status(500).send({message: `Error on the petition: ${err}`});
    }
    if(!key){
      return res.status(404).send({message: `Key does not exist`});
    }
    else{
      res.status(200).send({publicKey : key.publicKey});
    }
  })
}

function sharedkeys(req, res){

  var kshared = req.body;
  console.log(req.body);
  KeysPaillier.findOne({ keytype: "melectoral" }, function (err, key){
    if(err){
      return res.status(500).send({message: `Error on the petition: ${err}`});
    }
    if(!key){
      return res.status(404).send({message: `Key does not exist`});
    }
    else{
      var comb = secrets.combine(kshared.slice(0,3));
      console.log("The combination of 3 of 4 is correct?");
      var privatePaillierShares = key.privateKey.lambda+"f"+key.privateKey.mu;
      console.log(comb.toString());
      console.log(privatePaillierShares.toString())
      console.log("Las Claves son correctas?");
      console.log(comb=== privatePaillierShares.toString());
      if(comb===privatePaillierShares.toString()){
        var election = {
          enabled: false
        }
        var comb_split = privatePaillierShares.toString().split("f");
        var lambda = comb_split[0];
        var mu = comb_split[1];
        console.log(lambda+"    "+mu);
        privatePaillierShares = null;

        Election.update(election,function(err, user){
          if(err) {
              console.log(err);
              return res.status(500).json("Server error");
          }
          else{
              res.status(200).send({message:"EMPEZANDO EL RECUENTO..."});

              var resultados = getResults();
              return resultados;
          }
        });
      }
      else{
          return res.status(400).send({message:"Claves erróneas"});
      }
    }
  })


}

function getResults(req, res) {

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
        var n2=bignum(n).pow(2);

        for (var i = 0; i < nvotos; i++) {
            producto = producto * votos[i];
        }

        var tally = bignum(producto).mod(n2);
        var resultado_f1 = bignum(tally).pown(lambda,n2);
        var resultado_f2 = bignum(resultado_f1).sub(1).div(n);
        var resultados = bignum(resultado_f2).mul(mu).mod(n).toNumber();

        var resultado = {};

        for (var i=1; i<=npartidos; i++){

            resultado[ i + 'partido' ] = Math.floor((resultados / Math.pow(10,npartidos-1)) % 10);
        }

        /*var resultado = {
            '1partido' : Math.floor((resultados / 1) % 10),
            '2partido' : Math.floor((resultados / 10) % 10),
            '3partido' : Math.floor((resultados / 100) % 10),
            '4partido' : Math.floor((resultados / 1000) % 10)
        };*/

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
