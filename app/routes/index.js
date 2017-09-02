'use strict';

var DataHandler = require('../server/dataHandler.js');

module.exports = function(app) {
    
    var dataHandler = new DataHandler();

    app.route('/')
        .get(function(req, res) {
            res.sendFile(process.cwd() + '/public/index.html');
        });
        
    app.route('/list')
        .get(dataHandler.currentList);

};
