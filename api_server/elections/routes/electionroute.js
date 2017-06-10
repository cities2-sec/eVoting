
const express = require('express');
const electionCtrl = require ('../controller/election');
const api = express.Router();


//userCtrl
api.post('/new_election', electionCtrl.new_election);
api.get('/get_election', electionCtrl.get_election);



module.exports = api;
