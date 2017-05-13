/**
 * Created by juan on 07/05/17.
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
