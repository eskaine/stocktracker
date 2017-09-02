'use strict';

var Stocks = require('../models/stocks.js');
var QueryHandler = require('./queryHandler.js');

function dataHandler() {

    var queryHandler = new QueryHandler();
    var dhThis = this;

    dhThis.getPastYearData = function(dataset) {
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
                console.log(date);
            }

            date = new Date(date);

            //end loop
            if (date.getTime() < oneYearAgo.getTime())
                return arr;

            let d = {};
            d.date = dateStr;
            d.price = dataset['Time Series (Daily)'][data]['4. close'];
            arr.push(d);
        }
    }

    dhThis.currentList = function(req, res) {
        
        Stocks.find({}, { '_id': false })
            .exec(function(err, result) {
                if (err) throw err;
                
                if(result[0].list.length === 0) {
                    res.json();
                } else {
                     queryHandler.queryMany(result[0].list)

                    .then(function fulfilled(datasets) {
                        let processedDatasets = [];
                        
                        datasets.forEach(function(dataset, i) {
                            processedDatasets.push(dhThis.getPastYearData(dataset));
                            if (i === result[0].list.length - 1) {
                                let jsondata = { 'list': result[0].list, 'data': processedDatasets };
                                res.json(jsondata);
                            }
                        });
                    }, function rejected(err) {
                        if(err) throw err;
                        console.log('promise error');
                    });
                }
            });
    }

    this.addStock = function(stockcode) {
        Stocks.update({}, { $push: { list: stockcode } })
            .exec(function(err) {
                if (err) throw err;
            });
    }

    dhThis.delStock = function(stockcode) {
        Stocks.update({}, { $pull: { list: stockcode } })
            .exec(function(err) {
                if (err) throw err;
            });
    }

    this.checkStock = function(stockcode) {
        return new Promise(function(resolve, reject) {
            Stocks.find({ list: stockcode })
                .exec(function(err, result) {
                    if (err) throw err;

                    if (result.length === 0)
                        resolve();
                    else 
                        reject('Stock is already on display!');
                });
        });
    }

}

module.exports = dataHandler;
