'use strict';

var Stock = require('../models/stock.js');
var QueryHandler = require('./queryHandler.js');

var queryHandler = new QueryHandler();

function dataHandler() {

    let This = this;

    this.requestList = function(req, res) {
        console.log('requesting');
        let currentDate = new Date().toDateString();
        currentDate = new Date(currentDate);

        function sendList(res) {
            This.findStocks()
                .then(function fulfilled(result) {
                    console.log('send 2');
                    if (result.length === 0) {
                        res.json();
                    }
                    else {
                        res.json(result);
                    }
                });
        }


        //check for outdated data
        Stock.find({ 'updated': { $lt: currentDate } }, { '__v': 0, 'data': 0 })
            .exec(function(err, result) {
                if (err) throw err;

                //send if data is updated
                if (result.length === 0) {
                    console.log('r send');
                    sendList(res);
                }

                //update data before sending
                else {
                    updateList(result, 0, res)
                        .then(function fulfilled(result) {
                            console.log('r send 2');
                            sendList(res);
                        });
                }
            });
    }


    this.findStocks = function() {
        return new Promise(function(resolve, reject) {
            Stock.find({}, { '__v': 0, 'updated': 0 })
                .exec(function(err, result) {
                    if (err) throw err;

                    return resolve(result);
                });
        });
    }


    this.addStock = function(stockcode, data) {
        return new Promise(function(resolve, reject) {
            var newStock = new Stock();
            newStock._id = stockcode;

            //set date at midnight/neutral time
            newStock.updated = new Date().toDateString();
            newStock.data = processStockData(data);
            newStock.save(function(err, result) {
                if (err) throw err;
                resolve();
            });
        });
    }


    this.delStock = function(stockcode) {
        return new Promise(function(resolve) {
            Stock.deleteOne({ '_id': stockcode })
                .exec(function(err, result2) {
                    if (err) throw err;

                    This.findStocks()
                        .then(function fulfilled(result) {
                            return resolve(result);
                        });
                });
        });

    }

}

module.exports = dataHandler;

function processStockData(dataset) {
    let arr = [];

    var oneYearAgo = new Date();
    oneYearAgo = (oneYearAgo.getFullYear() - 1) + '-' + (oneYearAgo.getMonth() + 1) + '-' + oneYearAgo.getDate();
    oneYearAgo = new Date(oneYearAgo);

    for (var data in dataset['Time Series (Daily)']) {
        let dateStr = data;
        let date = data;
        if (data.length > 10) {
            date = date.split(' ');
            date = date[0];
            dateStr = date;
        }

        let d = {};
        d.date = new Date(dateStr);
        d.price = dataset['Time Series (Daily)'][data]['4. close'];
        arr.push(d);

        date = new Date(date);
        //end loop
        if (date.getTime() < oneYearAgo.getTime()) {
            return arr;
        }
    }
}


function updateList(stocks, i, res) {

    return new Promise(function(resolve, reject) {
        queryHandler.queryOne(stocks[i]._id)
            .then(function fulfilled(result) {
                return updateStock(stocks[i]._id, result);
            }, function rejected(err) {
                console.error(err);
            })


            .then(function fulfilled() {
                if (i === stocks.length - 1)
                    resolve();
                else
                    updateList(stocks, i + 1);
            }, function rejected(err) {
                console.error(err);
            });
    });
}



function updateStock(stockcode, data) {
    return new Promise(function(resolve, reject) {

        Stock.findOneAndUpdate({ '_id': stockcode }, { 'updated': new Date().toDateString(), 'data': processStockData(data) })
            .exec(function(err, result) {
                if (err)
                    return reject(err);

                return resolve();
            });
    });
}
