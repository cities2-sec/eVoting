/**
 * Created by VictorMiranda on 03/02/2017.
 */

const express = require('express');
const pollingStation = require ('../controller/pollingStationCtrl');
const api = express.Router();

//api.post('/logIn', userCtrl.logIn);
//api.post('/singIn', userCtrl.signIn);
//api.get('/private', auth, userCtrl.authUser);

api.get('/keys', pollingStation.getKeys);
api.get('/results', pollingStation.getResults);

module.exports = api;
