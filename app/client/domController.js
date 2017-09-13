'use strict';

var addButton = document.querySelector('#add-btn');
var input = document.querySelector('#input');
var panelGroup = document.querySelector('#panel-group');

var dom = {

    generatePanels: function(dataset) {
        dataset.forEach(function(stock) {
            addPanel(stock._id);
        });
    },

    deletePanel: function(stockcode) {
        let panel = document.querySelector('#' + stockcode);
        panelGroup.removeChild(panel);
    },

    emitInput: function(fn, e) {
        if (typeof fn !== 'function') {
            console.error('Not a function!');
        }

        input.placeholder = 'Stockcode';
        
        //check stock is already listed
        if (document.querySelector('#' + input.value.toUpperCase())) {
            input.value = '';
        }
        else if (input.value) {
            fn('add', input.value);
            input.value = '';
        }
    },

    setInput: function(message) {
        input.placeholder = message;
    },
  
};

module.exports = dom;

function addPanel(stockcode) {
    if (!document.querySelector('#' + stockcode)) {
        let panel = document.createElement('div');
        panel.setAttribute('class', 'stock');
        panel.setAttribute('id', stockcode);

        let panelBody = document.createElement('div');
        panelBody.setAttribute('class', 'label-text')
        panelBody.innerHTML = stockcode;

        let close = '<button type="button" class="close" aria-label="Close"><span class="close-icon" aria-hidden="true">&times;</span></button>';

        panel.appendChild(panelBody);
        panel.innerHTML += close;
        panelGroup.insertBefore(panel, panelGroup.childNodes[panelGroup.childElementCount - 1]);
    }
}
