'use strict';

(function() {

    var socket = io.connect('https://stocktracker-eskaine.c9users.io/');

    var addButton = document.querySelector('#add-btn');
    var input = document.querySelector('#input');
    var stocksList = document.querySelector('#list');

    function generateStockPanel(data) {
        let panel = document.createElement('div');
        panel.setAttribute('class', 'stock');
        panel.setAttribute('id', data.stockcode);

        let panelBody = document.createElement('div');
        //console.log(data.stockcode);
        panelBody.innerHTML = data.stockcode.toUpperCase();
        
        let close = '<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>';

        panel.appendChild(panelBody);
        panel.innerHTML += close;
        stocksList.appendChild(panel);

    }

    function emitStockCode(emitType, emitValue) {
        socket.emit(emitType, {
            'stockcode': emitValue
        });
    }
    
    function delStock(data) {
        let element = document.querySelector('#' + data.stockcode);
        stocksList.removeChild(element);
    }

    input.addEventListener('keypress', function(e) {
        if (e.keyCode === 13 && input.value) {
            emitStockCode('add-stock', input.value);
        }
    });

    addButton.addEventListener('click', function() {
        if (input.value) {
            emitStockCode('add-stock', input.value);
        }
    });

    //close stock
    document.addEventListener('click', function(e) {
        if (e.target.parentElement.className === 'close') {
           emitStockCode('del-stock', e.target.parentElement.parentElement.id);
        }
    });

    socket.on('add-stock', function(stockcode) {
        generateStockPanel(stockcode);
    });
    
    socket.on('del-stock', function(stockcode) {
        delStock(stockcode);
    });

})();
