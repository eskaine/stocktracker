'use strict';

var socket = io.connect('https://stocktracker-eskaine.c9users.io/');
var addButton = document.querySelector('#add-btn');
var input = document.querySelector('#input');
var stocksList = document.querySelector('#list');


function generateStockPanel(stockcode) {
    let panel = document.createElement('div');
    panel.setAttribute('class', 'stock');
    panel.setAttribute('id', stockcode);

    let panelBody = document.createElement('div');
    panelBody.setAttribute('class', 'label-text')
    panelBody.innerHTML = stockcode;

    let close = '<button type="button" class="close" aria-label="Close"><span class="close-icon" aria-hidden="true">&times;</span></button>';

    panel.appendChild(panelBody);
    panel.innerHTML += close;
    stocksList.insertBefore(panel, stocksList.childNodes[stocksList.childElementCount-1]);

}

function emitStockCode(emitType, emitValue) {
    socket.emit(emitType, {
        'stockcode': emitValue.toUpperCase()
    });
    input.value = '';
}

function delStock(stockcode) {
    let element = document.querySelector('#' + stockcode);
    stocksList.removeChild(element);
}

function resetPlaceholder() {
    input.placeholder = 'Stockcode';
}

input.addEventListener('keypress', function(e) {
    resetPlaceholder();
    if (e.keyCode === 13 && input.value) {
        emitStockCode('add', input.value);
    }
});

addButton.addEventListener('click', function() {
    resetPlaceholder();
    if (input.value) {
        emitStockCode('add', input.value);
    }
});

//close stock
document.addEventListener('click', function(e) {
    if (e.target.parentElement.className === 'close') {
        emitStockCode('delete', e.target.parentElement.parentElement.id);
    }
});

socket.on('add', function(data) {
    //console.log(data);
    generateStockPanel(data.stockcode);
});

socket.on('delete', function(data) {
    delStock(data.stockcode);
});

socket.on('invalid', function(msg) {
    input.placeholder = msg;
});
