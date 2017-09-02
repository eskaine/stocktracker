/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, {
/******/ 				configurable: false,
/******/ 				enumerable: true,
/******/ 				get: getter
/******/ 			});
/******/ 		}
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var socket = io.connect('https://stocktracker-eskaine.c9users.io/');
var ajax = __webpack_require__(1);
var dom = __webpack_require__(4);
var session = __webpack_require__(3);
var attr = __webpack_require__(5);
var draw = __webpack_require__(2);

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


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var ajaxFunctions = {
   ready: function ready(fn) {
      if (typeof fn !== 'function') 
         return;

      if (document.readyState === 'complete') 
         return fn();

      document.addEventListener('DOMContentLoaded', fn, false);
   },
   ajaxRequest: function ajaxRequest(method, url, callback) {
      var xmlhttp = new XMLHttpRequest();

      xmlhttp.onreadystatechange = function() {
         if (xmlhttp.readyState === 4 && xmlhttp.status === 200) {
            callback(xmlhttp.response);
         }
      };

      xmlhttp.open(method, url, true);
      xmlhttp.send();
   }
};


module.exports = ajaxFunctions;

/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var attr = __webpack_require__(5);
var constant = attr.constant;

var svg = d3.select('svg');
var canvas = svg.append('g')
    .attr('id', 'chart-group')
    .attr('transform', 'translate(' + constant.CHART_MARGIN.X + ',' + constant.CHART_MARGIN.Y + ')');

var linegroup = '';
var gridgroup = '';

var parseTime = d3.timeParse("%Y-%m-%d");

var x = d3.scaleTime();
var y = d3.scaleLinear().range([0, constant.OFFSETTED_HEIGHT]);

var axisX = d3.axisBottom(x)
    .tickFormat(d3.timeFormat("%b %y"))
    .tickSizeOuter(0);

var axisY = d3.axisLeft(y)
    .tickSize(0)
    .ticks(5);

var line = d3.line()
    .x(function(d) { return x(parseTime(d.date)); })
    .y(function(d) { return y(parseFloat(d.price)); });

var draw = {
    
    axisX: function() {
        let width = attr.width();

        //remove existing grid
        if (document.querySelector('#grid-group')) {
            document.querySelector('#grid-group').innerHTML = '';
        }

        //draw grid
        gridgroup.selectAll('line')
            .data(constant.GRID_SECTION)
            .enter()
            .append('line')
            .attr('stroke', '#384d67')
            .attr('x1', 0)
            .attr('y1', function(d) { return d; })
            .attr('x2', width)
            .attr('y2', function(d) { return d; });

        //remove existing axis x
        if (document.querySelector('.axisX')) {
            let cX = document.querySelector('.axisX');
            document.querySelector('#chart-group').removeChild(cX);
        }

        //prepare axis x 
        x.domain([new Date(attr.oneYearAgo()), new Date(attr.currentDate())])
            .range([0, width]);
        axisX.ticks(d3.timeMonth.every(attr.monthsPerTick()));

        //draw axis x
        canvas.append('g')
            .attr('class', 'axisX')
            .attr("transform", "translate(0," + constant.CHART_HEIGHT + ")")
            .call(axisX);
    },

    axisY: function(max, min) {
        y.domain([max, min]);

        canvas.append('g')
            .attr('class', 'axisY')
            .attr("transform", "translate(" + constant.AXIS_Y_MARGIN + ",0)")
            .call(axisY);
    },
    
    //draw chart without data
    baseChart: function() {
        linegroup = canvas.append('g')
            .attr('id', 'line-group');

        gridgroup = canvas.append('g')
            .attr('id', 'grid-group');

        //draw axis
        this.axisX();;
        this.axisY(attr.priceCap(), attr.priceOffset());
    },

    stock: function(stockcode, data) {
        if (document.querySelector('#' + stockcode + '_CHART')) {
            let linechart = document.querySelector('#' + stockcode + '_CHART');
            document.querySelector('#line-group').removeChild(linechart);
        }

        linegroup.append("path")
            .datum(data)
            .attr('id', stockcode + '_CHART')
            .attr('class', 'stockitem')
            .attr("fill", "none")
            .attr("stroke", "steelblue")
            .attr("stroke-linejoin", "round")
            .attr("stroke-linecap", "round")
            .attr("stroke-width", 1.5)
            .attr('d', line);
    },

     stocks: function() {
       if (sessionStorage.keys) {
            let keys = JSON.parse(sessionStorage.keys);
            for (var i = 0, n = keys.length; i < n; i++) {
                let key = keys[i];
                let data = JSON.parse(sessionStorage[key]);
                this.stock(key, data);
            }
        }
    },

    //draw data
    chartData: function(data) {
        let newMax = d3.max(data);
        newMax = parseFloat(newMax.price);

        let currentMaxPrice = parseFloat(attr.getMaxPrice());

        if (newMax > currentMaxPrice) {
            attr.setMaxPrice(newMax);

            if (document.querySelector('.axisY')) {
                let cY = document.querySelector('.axisY');
                document.querySelector('#chart-group').removeChild(cY);
            }

            this.axisY(attr.priceCap(), attr.priceOffset());
        }
        this.stocks();
    }

};


module.exports = draw;

/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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


/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const CHART_MARGIN = {
 X: 85,
 Y: 30
};

const CHART_HEIGHT = 330;

//axis x
const MONTHS_PER_YEAR = 12;
const AXIS_X_PX_PER_TICK = 100;
const WIDTH_OFFSET = 180;

//axis y 
const HEIGHT_UNIT = 11;
const HEIGHT_UNIT_PRICE_TIER = [25, 50, 75, 100];
const AXIS_Y_MARGIN = -10;
const DEFAULT_PRICE = 900;
var priceTier = 0;
var maxPrice = 0;

//grid
const GRID_OFFSET = 2;
const PX_PER_UNIT = 30;
const OFFSETTED_HEIGHT = CHART_HEIGHT - (GRID_OFFSET * PX_PER_UNIT);
const GRID_SECTION = [1 * PX_PER_UNIT, 3 * PX_PER_UNIT, 5 * PX_PER_UNIT, 7 * PX_PER_UNIT, 9 * PX_PER_UNIT];

var constant = {
 CHART_MARGIN: CHART_MARGIN,
 CHART_HEIGHT: CHART_HEIGHT,
 OFFSETTED_HEIGHT: OFFSETTED_HEIGHT,
 AXIS_Y_MARGIN: AXIS_Y_MARGIN,
 GRID_SECTION: GRID_SECTION
};

var attributes = {

 constant: constant,

 width: function() {
  return parseInt(d3.select('#chart').style('width'), 10) - WIDTH_OFFSET;
 },

 currentDate: function() {
  let date = new Date().toDateString().split(' ');
  date.shift();
  date = date.join(' ');
  return date;
 },

 oneYearAgo: function() {
  let date = this.currentDate().split(' ');
  date[2] -= 1;
  date = date.join(' ');
  return date;
 },

 monthsPerTick: function() {
  let totalTick = Math.floor(this.width() / AXIS_X_PX_PER_TICK);
  return Math.floor(MONTHS_PER_YEAR / totalTick);
 },

 setMaxPrice: function(price) {
  maxPrice = price;
 },

 getMaxPrice: function() {
  return maxPrice;
 },

 priceOffset: function() {
  return GRID_OFFSET * HEIGHT_UNIT_PRICE_TIER[priceTier];
 },

 priceCap: function() {
  let stockprice = maxPrice / 10;
  for (var i = 0, n = HEIGHT_UNIT_PRICE_TIER.length; i < n; i++) {
   if (stockprice < HEIGHT_UNIT_PRICE_TIER[i]) {
    priceTier = i;
    return HEIGHT_UNIT_PRICE_TIER[i] * HEIGHT_UNIT;
   }
  }
 }

};

module.exports = attributes;


/***/ })
/******/ ]);