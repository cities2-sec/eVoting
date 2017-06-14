/**
 * Created by VictorMiranda on 03/02/2017.
 */

const express = require('express');
const ballotBoxCtrl = require ('../controller/ballotBoxCtrl');
//const auth = require('../../middlewares/auth');
const api = express.Router();

api.post('/vote', ballotBoxCtrl.toVote);
api.get('/open', ballotBoxCtrl.openBox);
api.get('/kpaillier', ballotBoxCtrl.getKeysPaillier);

module.exports = api;
