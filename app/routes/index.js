'use strict';

var path = process.cwd();
var DataHandler = require(path + '/app/controllers/dataHandler.server.js');

module.exports = function(app) {
    
    var dataHandler = new DataHandler();

    app.route('/')
        .get(function(req, res) {
            res.sendFile(path + '/public/index.html');
        });
        
    app.route('/list')
        .get(dataHandler.getStock);

};
