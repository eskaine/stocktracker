'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var socket = require('socket.io');
var sockets = require('./app/sockets/sockets.js');

var app = express();
require('dotenv').load();

mongoose.connect(process.env.MONGO_URI, { useMongoClient: true });
mongoose.Promise = global.Promise;

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/common', express.static(process.cwd() + '/app/common'));
app.use('/js', express.static(process.cwd() + '/app/controllers'));
app.use('/socket', express.static(process.cwd() + '/node_modules/socket.io-client/dist'));

routes(app);

var port = process.env.PORT || 8080;
var server = app.listen(port, function() {
  console.log('Listening on port ' + port + '...');
});

var io = socket(server);
sockets(io, socket);

