/**
 * Inicialización del servidor de eVoting.
 */
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const logger = require("morgan");
const path = require("path");
const auth = require('./api_server/middlewares/auth');
const Election = require('./api_server/elections/model/SchemaElection');

// AllowCrossDomain Function
const allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' === req.method) {
        res.send(200);
    }
    else {
        next();
    }
};

/* Dependencies */
const censo = require('./api_server/censo/routes/censo');
const mesa = require ('./api_server/mesa/routes/pollingStation');
const urna = require ('./api_server/urna/routes/ballotBox');
const election = require('./api_server/elections/routes/electionroute');
const ttp = require('./api_server/ttp/routes/ttp');

/* App */
app.use(allowCrossDomain);
app.use(express.static(path.join(__dirname, 'web'))); // Static Web
app.use(logger('dev'));
app.use(bodyParser.urlencoded({extended:false}));
app.use(bodyParser.json());

/* Routes */
app.use('/censo', censo);
app.use('/mesa', mesa);
app.use('/urna', urna);
app.use('/election', election);
app.use('/ttp', ttp);

app.get('/', function (err, res) {
    res.send({message: 'Welcome to my API'});
});
app.get('/censo/login', function (err, res) {
  res.sendFile(__dirname + '/web/views/censo/index.html'); //login censo
});
app.get('/censo', function (err, res) {
  res.sendFile(__dirname + '/web/views/censo/censo.html'); //login censo
});
app.get('/urna', function (err, res) {
    Election.find( function (err, key){
        if(err){
            return res.status(500).send({message: `Error on the petition: ${err}`});
        }
        if(!key){
            return res.status(404).send({message: `Key does not exist`});
        }
        else{
            if(key.enabled===false){
                res.sendFile(__dirname + '/web/views/urna/urna_resultados.html');
            }
            else{
                res.sendFile(__dirname + '/web/views/urna/urna.html');
            }
        }
    });
});
app.get('/urna/resultados', function (err, res) {
    Election.find( function (err, key){
        if(err){
            return res.status(500).send({message: `Error on the petition: ${err}`});
        }
        if(!key){
            return res.status(404).send({message: `Key does not exist`});
        }
        else{
            if(key.enabled===true){
                res.sendFile(__dirname + '/web/views/urna/urna_resultados.html');
            }
            else{
                res.sendFile(__dirname + '/web/views/urna/urna.html');
            }
        }
    });
});
app.get('/home', function (err, res) {
  res.sendFile(__dirname + '/web/views/home/home.html'); //login censo
});

module.exports = app;
