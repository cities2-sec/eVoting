
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


module.exports = {
    new_election,
    get_election
}
