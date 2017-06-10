/**
 * Created by juan on 07/05/17.
 */

const mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
const Schema = mongoose.Schema;

const candidateSchema =  new Schema({
    sigla: { type: String, unique: true },
    candidatos : [{
        type: String
    }]
});

candidateSchema.plugin(mongooseUniqueValidator);
module.exports = mongoose.model('candidateModel', pollingStationSchema);
