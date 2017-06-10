/**
 * Created by VictorMiranda on 03/02/2017.
 */
var $ = require('jquery');
const PollingStation = require('../model/pollingStationModel');
const service = require('../../services');

function getKeys (req, res) {
    return res.json({keys: global.PollingStationKey});
}

function getResults (req, res){

    var voting_ended;

    PollingStation.find(
        {name: req.params.name},
        function (err, station) {
            if(err){
                return null;
            }
            console.log(station.active);
            voting_ended = station.active;

        }
    );

    if(voting_ended){
        $.get(global.API + '/api/urna/open',function(data){
            votos = data;
        });
    }
    else{
        return res.status(403).send("La votació no ha acabat");
    }
}

function markVotingEnd (req, res){
  PollingStation.update (
      {
          name: req.params.name
      },
      { $set: {active: false} },
      function (err) {
          if (err)
              res.send(err);
      });
}

function markVotingStart ( req, res ){
    PollingStation.update (
        {
            name: req.body.name
        },
        { $set: {active: true} },
        function (err) {
            if(err) {
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
