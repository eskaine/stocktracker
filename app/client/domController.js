'use strict';

var addButton = document.querySelector('#add-btn');
var panelGroup = document.querySelector('#panel-group');

var dom = {

    addPanel: function(stockcode) {
        createPanel(stockcode);
    },
    
    addTip: function(stockcode) {
        let tipStocks = document.querySelector('#tip-group');
        let tipBox = document.createElement('div');
        tipBox.setAttribute('id', stockcode + '_TIP');
        tipStocks.appendChild(tipBox);
    },

    deletePanel: function(stockcode) {
        let panel = document.querySelector('#' + stockcode);
        panelGroup.removeChild(panel);
    },

    deleteTip: function(stockcode) {
        let focusGroup = document.querySelector('#focus-group');
        let focus = document.querySelector('#' + stockcode + '_FOCUS');
        focusGroup.removeChild(focus);

        let tipGroup = document.querySelector('#tip-group');
        let tip = document.querySelector('#' + stockcode + '_TIP');
        tipGroup.removeChild(tip);
    },
};

module.exports = dom;

function createPanel(stockcode) {
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
