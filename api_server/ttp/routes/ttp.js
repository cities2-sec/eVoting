/**
 * Routes TTP
 */

const express = require('express');
const keyCtrl = require('../controller/keys');
const api = express.Router();

api.post('/', keyCtrl.postKey);
api.get('/', keyCtrl.getKey);


module.exports = api;
