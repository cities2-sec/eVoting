/**
 * Created by VictorMiranda
 * This file is a root directory which execute the app and server
 * It is using a ECMAScript 6, The future standard for Javascript
 */

/* Here it has to include the dependencies which it will use */
/* Express , Body-Parser , Mongoose */

const fs = require('fs'); // Dependencie for reading Files
const mongoose = require("mongoose");
const app = require('./app');
const config = require('./config');
const keys = require('./api_server/services');
const https = require('https');

/* Connexion to Mongodb */
//mongoose.Promise = global.Promise;
mongoose.connect(config.db, function (err, res) {
    if(err){
        return console.log(`ERROR: connecting to Database: ${err}`);
    }
    console.log('Connected to Database correctly!');

    /* CREATING KEYS */
    keys.createKeys("censo");
    keys.createKeys("ttp");
    keys.createKeys("userTest");
    //keys.createKeys("urna");
    //keys.createSecretSharing("melectoral");
    /*keys.createSecretSharing("melectoral",function(shared_keys){
        console.log("hola");
    });*/



    /* Server listening for HTTP */
    app.listen(config.port, function () {
        console.log(`Running server on http://${config.ip}:${config.port}`);
    });
    /*
    app.listen(config.port, config.ip, function () {
        console.log(`Running server on http://${config.ip}:${config.port}`);
    });*/

    global.API = `http://${config.ip}:${config.port}`;

    try{
      var privateKey  = fs.readFileSync('cert/mysitename.key', 'utf8');
      var certificate = fs.readFileSync('cert/mysitename.crt', 'utf8');
      var credentials = {key: privateKey, cert: certificate};
      var httpsServer = https.createServer(credentials, app);

      /* Server listening for HTTPS */
      
      httpsServer.listen(config.secure_port, function () {
          console.log(`Running server on https://${config.ip}:${config.secure_port}`);
      });
    }
    catch (err){
      console.log('Https server is not running now');
      console.log(`${err}`);
    }

});
