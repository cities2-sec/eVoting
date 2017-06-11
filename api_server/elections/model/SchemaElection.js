
/**
 * Created by Azeez on 01/06/2017.
 *
 * This file is a model of our User
 * It is using a ECMAScript 6, The future standard for Javascript
 */
const mongoose = require('mongoose');
const schema = mongoose.Schema;
const bcrypt = require('bcrypt-nodejs');



const ElectionSchema =  new schema({
    datetime: Date,
    electionName: String,
    //Datos rellenados por el usuario
    parties : [{name: String,
        id: String,
        color : String,
    }],
    enabled: Boolean
});



module.exports = mongoose.model('Election', ElectionSchema);
