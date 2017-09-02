'use strict';

var QueryHandler = require('../server/queryHandler.js');
var DataHandler = require('../server/dataHandler.js');

module.exports = function(io, socket) {

    var queryHandler = new QueryHandler();
    var dataHandler = new DataHandler();

    io.on('connection', function(socket) {
        console.log(socket.id + ' connected...');

        socket.on('add', function(data) {
            
            //check if data exist in database
            dataHandler.checkStock(data.stockcode)

            //get query data
            .then(function fulfilled() {
                return queryHandler.queryOne(data.stockcode);
            }, function rejected(err) {
                return Promise.reject(err);
            })

            //process query data
            .then(function fulfilled(result) {
                return dataHandler.getPastYearData(result);
            }, function rejected(err) {
                if (err === 'Invalid stockcode!') {
                    socket.emit('invalid', err);
                }
                return Promise.reject(err);
            })

            //emit processed data
            .then(function fulfilled(result) {
                //add stockcode to database
                dataHandler.addStock(data.stockcode);
                //add processed data to received emitted data
                data.data = result;
                
                io.sockets.emit('add', data);
            }, function(err) {
                console.log(err);
            });

        });

        socket.on('delete', function(data) {
            dataHandler.delStock(data.stockcode);
            io.sockets.emit('delete', data);
        });
    });

};
