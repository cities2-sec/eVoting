/**
 * Created by VictorMiranda on 03/02/2017.
 */

const express = require('express');
const userCtrl = require ('../controller/user');
const identityCtrl = require ('../controller/identity');
const auth = require('../../middlewares/auth');
const api = express.Router();

api.post('/login', userCtrl.login);
api.post('/signin', userCtrl.register);
api.get('/private', auth, userCtrl.authUser);
api.get('/stats', userCtrl.censoStats);

api.post('/identity/request', auth, identityCtrl.identityRequest);

module.exports = api;
