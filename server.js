'use strict';

var express = require('express');
var routes = require('./app/routes/index.js');
var mongoose = require('mongoose');
var socket = require('socket.io');


var app = express();
require('dotenv').load();

mongoose.connect(process.env.MONGO_URI, { useMongoClient: true });
mongoose.Promise = global.Promise;

app.use('/public', express.static(process.cwd() + '/public'));
app.use('/js', express.static(process.cwd() + '/app/controllers'));

routes(app, socket);

var port = process.env.PORT || 8080;
app.listen(port, function() {
  console.log('Node.js listening on port ' + port + '...');
});
