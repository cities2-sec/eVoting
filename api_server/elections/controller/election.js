
const Election = require('../model/ElectionSchema');
const service = require('../../services');
//const sha512 = require('js-sha512');
const bcrypt = require('bcrypt-nodejs');



function new_election (req, res){
    const election = new Election({
        datetime: req.body.datetime,
        electionName: req.body.electionName,
        parties: req.body.parties,
        enabled: req.body.enabled
    });
    election.save(function (err) {
        if(err) {
            console.log(err);
            return res.status(500).send({message:"Server Error"});
        }
        return res.status(200).send({message:"Election party created!"});
    })
}


function get_election(req, res) {

    Election.find().exec(function (err, elections) {
        if(err)  return res.status(500).send({message:"Server Error"});
        return res.status(200).send(elections);
        console.log(elections);
    });
}

function get_shared_keys(req, res) {
  console.log("GET SHARED KEY")
  service.createSecretSharing("melectoral",function(shared_keys){
    console.log("SHARED KEYS: " + shared_keys);
    if(shared_keys == 0){
      return res.status(500).send({message: "Server Error"})
    }
    if(shared_keys == 1){
      return res.status(404).send({message: "Las claves ya fueron entregadas"})
    }
    return res.status(200).send(shared_keys);
  });
}



module.exports = {
    new_election,
    get_election,
    get_shared_keys
}
