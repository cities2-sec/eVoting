/**
 * Created by VictorMiranda
 * This file is a root directory which execute the app and server
 * It is using a ECMAScript 6, The future standard for Javascript
 */

/* Here it has to include the dependencies which it will use */
/* Express , Body-Parser , Mongoose */

const mongoose = require("mongoose");
const app = require('./app');
const config = require('./config');
const keys = require('./api_server/services')

/* Connexion to Mongodb */
mongoose.Promise = global.Promise;
mongoose.connect(config.db, function (err, res) {
    if(err){
        return console.log(`ERROR: connecting to Database: ${err}`);
    }
    console.log('Connected to Database correctly!');

    //Creating Keys for Censo Urna and Mesaelectoral
    keys.createKeys("censo");
    //keys.createKeys("urna");
    keys.createSecretSharing("melectoral");

    /* Server listening for HTTP */
    app.listen(config.port, config.ip, function () {
        console.log(`Running server on http://${config.ip}:${config.port}`);
    });

});
