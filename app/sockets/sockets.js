'use strict';

var QueryHandler = require('../server/queryHandler.js');
var DataHandler = require('../server/dataHandler.js');

module.exports = function(io, socket) {

    var queryHandler = new QueryHandler();
    var dataHandler = new DataHandler();

    io.on('connection', function(socket) {
        console.log(socket.id + ' connected...');

        socket.on('add', function(stockcode) {
            
            queryHandler.queryOne(stockcode)

            //add data to database
            .then(function fulfilled(result) {
                return dataHandler.addStock(stockcode, result);
                //dataHandler.getList();
            }, function rejected(err) {
                if (err === 'Invalid stockcode!') {
                    socket.emit('invalid', err);
                }
                return Promise.reject(err);
            })

            //emit result
            .then(function fulfilled(result) {
                dataHandler.findStocks()
                .then(function fulfilled(result){
                    io.sockets.emit('add', result);    
                });
            }, function(err) {
                if (err) throw err;
            });

        });

        socket.on('delete', function(stockcode) {
            dataHandler.delStock(stockcode)
            .then(function fulfilled(result){
                 io.sockets.emit('delete', result);
            });
        });
        
    });
};
