/**
 * Created by VictorMiranda on 03/02/2017.
 */

const express = require('express');
const userCtrl = require ('../controller/user');
const auth = require('../../middlewares/auth');
const api = express.Router();

api.post('/logIn', userCtrl.logIn);
api.post('/singIn', userCtrl.signIn);
api.get('/private', auth, userCtrl.authUser);

module.exports = api;
