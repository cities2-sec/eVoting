/**
 * Created by VictorMiranda
 * This file is a root directory which execute the app and server
 * It is using a ECMAScript 6, The future standard for Javascript
 */

/* Here it has to include the dependencies which it will use */
/* Express , Body-Parser , Mongoose */

var fs = require('fs');
const mongoose = require("mongoose");
const app = require('./app');
const config = require('./config');
const keys = require('./api_server/services');
var https = require('https');

//var privateKey  = fs.readFileSync('cert/mysitename.key', 'utf8');
//var certificate = fs.readFileSync('cert/mysitename.crt', 'utf8');
//var credentials = {key: privateKey, cert: certificate};
//var httpsServer = https.createServer(credentials, app);

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

    //httpsServer.listen(8443, function () {
    //    console.log(`Running server on https://${config.ip}:8443`);
    //});
});

