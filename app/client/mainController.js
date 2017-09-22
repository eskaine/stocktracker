'use strict';

require('../common/styles');

var socket = io.connect('https://stocktracker-eskaine.c9users.io/');
var ajax = require('../common/ajax-functions');
var dom = require('./domController');
var property = require('./propertyController');
var chart = require('./chartController');

var input = document.querySelector('#input');
var url = window.location.origin + '/list';
(function() {
    
    //onload
    ajax.ready(function() {
        ajax.ajaxRequest('GET', url, function(result) {
            onLoad(result)
        });
    });

    socket.on('add', function(result) {
        onAdd(result);
    });

    socket.on('delete', function(result) {
        onDelete(result);
    });

    socket.on('invalid', function(result) {
        input.placeholder = result;
    });

    //enter keypress
    input.addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {
            emitData();
        }
    });

    document.querySelector('#add-btn').addEventListener('click', function() {
        emitData();
    });

    //close/delete stock
    document.addEventListener('click', function(e) {
        if (e.target.parentElement.className === 'close') {
            socket.emit('delete', e.target.parentElement.parentElement.id.toUpperCase());
        }
    });
})();

function emitData() {
    input.placeholder = 'Stockcode';

    //check stock is already listed
    if (document.querySelector('#' + input.value.toUpperCase())) {
        input.value = '';
    }
    else if (input.value) {
        socket.emit('add', input.value.toUpperCase());
        input.value = '';
    }
}

function onLoad(result) {
    if (result) {
        let dataset;
        result = JSON.parse(result);
        
        chart.parseData(result)
            .then(function fulfilled(parsedData) {
                dataset = parsedData;
                chart.drawAxis(parsedData);
            })
            .then(function fulfilled() {
                for (var i in dataset) {
                    chart.drawStock(dataset[i]);
                }
            });
    }
}

function onAdd(result) {
    let dataset;
    chart.parseData(result)
        .then(function fulfilled(parsedData) {
            dataset = parsedData;
            return chart.drawAxis(parsedData);
        })
        .then(function fulfilled(redraw) {
            if (redraw) {
                chart.redrawChart();
                chart.drawFocus(dataset[0]);
                dom.addTip(dataset[0]._id);
                dom.addPanel(dataset[0]._id);
            }
            else {
                chart.drawStock(dataset[0]);
            }
           
        });
}

function onDelete(stockcode) {
    chart.deleteData(stockcode)
        .then(function fulfilled(isHighest) {

            if (isHighest) {
                //reset current max price
                property.setMaxPrice(0);

                chart.drawAxis()
                    .then(function fulfilled() {
                        chart.redrawChart();
                    });
            }
        });
}
