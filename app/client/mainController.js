'use strict';

var socket = io.connect('https://stocktracker-eskaine.c9users.io/');
var ajax = require('../common/ajax-functions');
var dom = require('./domController');
var property = require('./attrController');
var draw = require('./drawController');

(function() {
    var url = window.location.origin + '/list';

    function loadChartData() {
        ajax.ajaxRequest('GET', url, function(result) {
            if (result) {
                result = JSON.parse(result);
                draw.lineChart(result);
                dom.generatePanels(result);
            }
        });
    }


    /*
    WINDOW EVENTS
    */

    //onload
    ajax.ready(function() {
        draw.baseChart();
        loadChartData();
    });

    //resize
    d3.select(window).on('resize', function() {
        draw.axisX();
        draw.lineChart();
    });



    /*
    SOCKET EVENTS
    */

    socket.on('add', function(result) {
        draw.lineChart(result);
        dom.generatePanels(result);
    });

    socket.on('delete', function(result) {
        //reset axis y cap
        property.setMaxPrice(0);
        draw.lineChart(result);
    });

    socket.on('invalid', function(result) {
        dom.setInput(result);
    });



    /*
    BUTTON EVENTS
    */

    //enter keypress
    document.querySelector('#input').addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {
            dom.emitInput(emitStockCode);
        }
    });

    document.querySelector('#add-btn').addEventListener('click', function() {
        dom.emitInput(emitStockCode);
    });

    //close/delete stock
    document.addEventListener('click', function(e) {
        if (e.target.parentElement.className === 'close') {
            emitStockCode('delete', e.target.parentElement.parentElement.id);
            dom.deletePanel(e.target.parentElement.parentElement.id);
        }
    });

    function emitStockCode(emitType, emitValue) {
        socket.emit(emitType, emitValue.toUpperCase());
    }

})();
