/**
 * Created by VictorMiranda on 03/02/2017.
 *
 * This file is a model of our User
 * It is using a ECMAScript 6, The future standard for Javascript
 */

const mongoose = require('mongoose');
var mongooseUniqueValidator = require('mongoose-unique-validator');
const schema = mongoose.Schema;

const ballotBoxSchema =  new schema({
    id_anomin: String,
    voted: Boolean,
    numOfVotes: Number,
    timestamp: Date,
    cipher: {
        n: {
            type: Number
        },
        lambda: {
            type: Number
        },
        mu: {
            type: Number
        }
    },
    votes: [{type: String
    }]
});

ballotBoxSchema.plugin(mongooseUniqueValidator);
module.exports = mongoose.model('ballotBoxModel', ballotBoxSchema);
