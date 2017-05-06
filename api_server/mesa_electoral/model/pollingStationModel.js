/**
 * Created by VictorMiranda on 03/02/2017.
 *
 * This file is a model of our User
 * It is using a ECMAScript 6, The future standard for Javascript
 */

const mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const pollingStationSchema =  new Schema({
    name: { type: String, unique: true },
    key: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'keysModel'
    }
});

pollingStationSchema.plugin(mongooseUniqueValidator);
module.exports = mongoose.model('pollingStationModel', pollingStationSchema);
