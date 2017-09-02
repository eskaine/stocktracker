'use strict';

var session = {
    
    clear: function(dataset) {
        if(sessionStorage.keys) {
            sessionStorage.removeItem('keys');
        }
    },
    
    save: function(stockcode, data) {
        //save stockcode to stockcode array
        if (!sessionStorage.keys) {
            sessionStorage.setItem('keys', JSON.stringify([stockcode]));
        }
        else {
            let keys = JSON.parse(sessionStorage.keys);
            keys.push(stockcode);
            sessionStorage.keys = JSON.stringify(keys);
        }
        //save data associated with stockcode
        sessionStorage.setItem(stockcode, JSON.stringify(data));
    },

    delete: function(stockcode) {
            //remove data associated with stockcode
            sessionStorage.removeItem(stockcode);

            let keys = JSON.parse(sessionStorage.keys);

            //remove stockcode from stockcode array
            if (keys.length > 1) {
                for (var i = 0, n = keys.length; i < n; i++) {
                    if (keys[i] === stockcode) {
                        keys.splice(i, 1);
                        sessionStorage.keys = JSON.stringify(keys);
                    }
                }
            }
            else {
                sessionStorage.removeItem('keys');
            }
    }
    
};

module.exports = session;