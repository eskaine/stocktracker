'use strict';

var Stocks = require('../models/stocks.js');

function dataHandler() {

    this.getPastYearData = function(dataset) {
        let arr = [];

        //get date of one year ago
        let oneYearAgo = dataset['Meta Data']['3. Last Refreshed'].split('-');
        oneYearAgo[0] = Number(oneYearAgo[0]) - 1;
        oneYearAgo.join('-');
        oneYearAgo = new Date(oneYearAgo);

        for (var data in dataset['Time Series (Daily)']) {

            let date = new Date(data);

            //stop data processing at one year's mark
            if (date.getTime() < oneYearAgo.getTime()) {
                return arr;
            }

            //let d = {};
            //d[data] = dataset['Time Series (Daily)'][data]['4. close'];
            arr.push({data: dataset['Time Series (Daily)'][data]['4. close']});
        }
    }
    
    this.getStock = function(req, res) {
        Stocks.find({}, {'_id': false})
        .exec(function (err, result) {
            if (err) throw err;
        
            res.json(result[0]);
        });
    }

    this.addStock = function(stockcode) {
        Stocks.update({}, { $push: { list: stockcode } })
           .exec(function(err) {
                if (err) throw err;
            });
    }
    
    this.delStock = function(stockcode) {
        Stocks.update({}, { $pull: { list: stockcode } })
           .exec(function(err) {
                if (err) throw err;
            });
    }
    
    this.checkStock = function(stockcode) {
        
        return new Promise(function (resolve, reject) {
        
            Stocks.find({ list: stockcode })
            .exec(function(err, result) {
                if (err) throw err;
                
                if (result.length === 0){
                    resolve();
               } else {
                    reject('Stock is already on display!');
                }
            });    
        });
        
        
        
        
    }

}

module.exports = dataHandler;
