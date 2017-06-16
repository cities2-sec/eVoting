/**
 * Routes TTP
 */

const express = require('express');
const keyCtrl = require('../controller/keys');
const api = express.Router();

api.post('/', keyCtrl.postKey);
api.get('/', keyCtrl.getKey);
api.get('/keys', keyCtrl.getTtpKeys);


module.exports = api;
