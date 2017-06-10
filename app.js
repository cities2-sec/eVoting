/**
 * Inicialización del servidor de eVoting.
 */
const express = require("express");
const app = express();
const bodyParser = require("body-parser");
const logger = require("morgan");
const path = require("path");
const auth = require('./api_server/middlewares/auth');

// AllowCrossDomain Function
const allowCrossDomain = function (req, res, next) {
    res.header('Access-Control-Allow-Origin', '*');
    res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
    res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, Content-Length, X-Requested-With');

    // intercept OPTIONS method
    if ('OPTIONS' == req.method) {
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


app.get('/', function (err, res) {
    res.send({message: 'Welcome to my API'});
});
app.get('/censo/login', function (err, res) {
  res.sendFile(__dirname + '/web/views/censo/index.html'); //login censo
});
app.get('/censo', function (err, res) {
console.log("hola");
  //No authorization
  //res.sendFile(__dirname + '/web/views/censo/index.html'); //login censo

  res.sendFile(__dirname + '/web/views/censo/censo.html'); //perfil censo
})


module.exports = app;
