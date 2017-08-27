'use strict';

var request = require('request');
var api = 'https://www.alphavantage.co/query?function=TIME_SERIES_DAILY&symbol=';

function queryHandler() {

    this.query = function(stockcode) {
        
        let query = api + stockcode + '&outputsize=full' + '&apikey=' + process.env.FINANCE_APIKEY;
        
        return new Promise(function(resolve, reject) {
            request(query, function(err, response, body) {
                if (err) throw err;

                body = JSON.parse(body);
                if (body.hasOwnProperty('Meta Data')) {
                    resolve(body);
                }
                else {
                    reject('Invalid stockcode!');
                }

            });
        });
    }

}

module.exports = queryHandler;
