/**
 * Routes Censo
 */

const express = require('express');
const userCtrl = require ('../controller/user');
const identityCtrl = require ('../controller/identity');
const keyCtrl = require('../controller/keys');
const auth = require('../../middlewares/auth');
const api = express.Router();

//userCtrl
api.post('/login', userCtrl.login);
api.post('/signin', userCtrl.register);
api.get('/private', auth, userCtrl.authUser);
api.get('/stats', userCtrl.censoStats);
//identityCtrl
api.post('/identity/request', auth, identityCtrl.identityRequest);
api.post('/identity/request2', auth, identityCtrl.identityRequest2);
//keyCtrl
api.get('/key', keyCtrl.getKey);


module.exports = api;
