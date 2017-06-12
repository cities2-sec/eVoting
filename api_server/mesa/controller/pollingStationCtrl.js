/**
 * Created by VictorMiranda on 03/02/2017.
 */
const PollingStation = require('../model/pollingStationModel');
const Keys = require('../../model/SchemaKeys');
const service = require('../../services');
const secrets = require('secrets.js');
const Election = require('../../elections/model/SchemaElection');
const bignum = require('bignum');

function getKeys(res) {
  Keys.findOne({ keytype: "melectoral" }, function (err, key){
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
  Keys.findOne({ keytype: "melectoral" }, function (err, key){
    if(err){
      return res.status(500).send({message: `Error on the petition: ${err}`});
    }
    if(!key){
      return res.status(404).send({message: `Key does not exist`});
    }
    else{
      var comb = secrets.combine(kshared.slice(0,3));
      console.log("The combination of 3 of 4 is correct?");
      console.log(comb==key.privateKey.p.toString());
      if(comb==key.privateKey.p.toString()){
        var election = {
          enabled: false
        }

        Election.update(election,function(err, user){
          if(err) {
              console.log(err);
              return res.status(500).json("Server error");
          }
          else{
            res.status(200).send({message:"EMPEZANDO EL RECUENTO..."});
          }
        });
      }
      else{
          return res.status(400).send({message:"Claves Erroneas"});
      }
    }
  })


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

    function countVotes(votos, nvotos, n, mu, lambda, npartidos) {
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

        //for (var i=0;i<npartidos;i++){
        //    resultado[ npartidos + 'partido' ] = Math.floor((resultados / Math.pow(10,npartidos-1)) % 10);
        //}

        var resultado = {
            '1partido' : Math.floor((resultados / 1) % 10),
            '2partido' : Math.floor((resultados / 10) % 10),
            '3partido' : Math.floor((resultados / 100) % 10),
            '4partido' : Math.floor((resultados / 1000) % 10)
        };

        return resultado;

    }

    if (voting_ended) {
        var n = 0;
        var mu = 0;
        var lambda = 0;
        $.get(global.API + '/api/urna/open', function (data) {
            votes = data.votes;
            num_votes = data.numOfVotes;
            n = data.cipher.n;
            mu = data.cipher.mu;
            lambda = data.cipher.lambda;
        });
        results = countVotes(votes, num_votes, n, mu, lambda);
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
    markVotingStart,
    sharedkeys
};
