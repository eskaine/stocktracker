'use strict';

var addButton = document.querySelector('#add-btn');
var input = document.querySelector('#input');
var panelGroup = document.querySelector('#panel-group');

var dom = {
    
    generatePanel: function(stockcode) {
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
    },


    emitInput: function(fn, e) {
        if(typeof fn !== 'function') {
            console.error('Not a function!');
        }
        
        input.placeholder = 'Stockcode';
        
        if(input.value && !e || input.value && e.keyCode === 13) {
            fn('add', input.value);
            input.value = '';
        }
    },
    
    setInput: function(message) {
            input.placeholder = message;
    },
    
    deleteStock: function(stockcode) {
        let panel = document.querySelector('#' + stockcode);
        let chart = document.querySelector('#' + stockcode + '_CHART');

        panelGroup.removeChild(panel);
        document.querySelector('#line-group').removeChild(chart);
    }
};

module.exports = dom;
