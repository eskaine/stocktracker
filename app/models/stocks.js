'use strict';

var mongoose = require('mongoose');
var Schema = mongoose.Schema;

var Stocks = new Schema ({
    list: Array
});

module.exports = mongoose.model('Stocks', Stocks);