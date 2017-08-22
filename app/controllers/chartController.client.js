'use strict';

(function() {
    
    var addButton = document.querySelector('#add-btn');
    //var closeButton = document.querySelector('.close');
    var input = document.querySelector('#input');
    var stocksList = document.querySelector('#list');

    function generateStockPanel() {
        let panel = document.createElement('div');
        panel.setAttribute('class', 'stock');

        let panelBody = document.createElement('div');
        panelBody.innerHTML = input.value.toUpperCase();
        
        let close = '<button type="button" class="close" aria-label="Close"><span aria-hidden="true">&times;</span></button>';

        panel.appendChild(panelBody);
        panel.innerHTML += close;
        stocksList.appendChild(panel);

    }

    function addStock() {
        if (input.value) {
            generateStockPanel();
        }
    }
    
    input.addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {
            addStock();
        }
    });

    addButton.addEventListener('click', function() {
        addStock();
    });
    
    document.addEventListener('click', function(e) {
        if(e.target.parentElement.className === 'close') {
            let rootParent = e.target.parentElement.parentElement;
            stocksList.removeChild(rootParent);
        }
    });

    
})();