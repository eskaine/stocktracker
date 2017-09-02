'use strict';

var socket = io.connect('https://stocktracker-eskaine.c9users.io/');
var ajax = require('../common/ajax-functions');
var dom = require('./domController');
var session = require('./sessionController');
var attr = require('./attrController');
var draw = require('./drawController');

(function() {
    var url = window.location.origin + '/list';
   
    function loadChartData() {
        ajax.ajaxRequest('GET', url, function(result) {
            if (result) {
                result = JSON.parse(result);
                for (var i = 0, n = result.list.length; i < n; i++) {
                    session.save(result.list[i], result.data[i]);
                    dom.generatePanel(result.list[i]);
                    draw.chartData(result.data[i]);
                }
            }
        });
    }
    
    function emitStockCode(emitType, emitValue) {
        socket.emit(emitType, {
            'stockcode': emitValue.toUpperCase()
        });
    }
    
    
    
    /*
    WINDOW EVENTS
    */
    
    //onload
    ajax.ready(function() {
        session.clear();
        draw.baseChart();
        loadChartData();
    });

    //resize
    d3.select(window).on('resize', function() {
        draw.axisX();
        draw.stocks();
    });
    
    
    
    /*
    SOCKET EVENTS
    */
    
    socket.on('add', function(result) {
        session.save(result.stockcode, result.data);
        draw.chartData(result.data);
        dom.generatePanel(result.stockcode);
    });

    socket.on('delete', function(result) {
        session.delete(result.stockcode);
        dom.deleteStock(result.stockcode);
        attr.setMaxPrice(0);

        if (sessionStorage.keys) {
            let keys = JSON.parse(sessionStorage.keys);
            keys.forEach(function(key) {
                let data = JSON.parse(sessionStorage[key]);
                draw.chartData(data);
            });
        }
    });

    socket.on('invalid', function(result) {
        dom.setInput(result);
    });



    /*
    BUTTON EVENTS
    */

    //enter keypress
    document.querySelector('#input').addEventListener('keypress', function(e) {
         dom.emitInput(emitStockCode, e);
    });

    document.querySelector('#add-btn').addEventListener('click', function() {
        dom.emitInput(emitStockCode);
    });

    //close stock
    document.addEventListener('click', function(e) {
        if (e.target.parentElement.className === 'close') {
            emitStockCode('delete', e.target.parentElement.parentElement.id);
        }
    });

})();
