/**
 * Created by VictorMiranda on 03/02/2017.
 */

const express = require('express');
const pollingStation = require ('../controller/pollingStationCtrl');
const api = express.Router();

api.get('/keys', pollingStation.getKeys);
api.get('/results/:name', pollingStation.getResults);
api.delete('/stopvoting/:name', pollingStation.markVotingEnd);
api.post('/startvoting', pollingStation.markVotingStart);

module.exports = api;
