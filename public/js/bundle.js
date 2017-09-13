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
/******/ 	return __webpack_require__(__webpack_require__.s = 1);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


const CHART_HEIGHT = 330;

//axis x
const MONTHS_PER_YEAR = 12;
const AXIS_X_PX_PER_TICK = 100;
const WIDTH_OFFSET = 180;

//axis y 
const HEIGHT_UNIT = 11;
const HEIGHT_UNIT_PRICE_TIER = [25, 50, 75, 100];

const DEFAULT_PRICE = 900;
var priceTier = 0;
var maxPrice = 0;

//grid
const GRID_OFFSET = 2;
const PX_PER_UNIT = 30;
const OFFSETTED_HEIGHT = CHART_HEIGHT - (GRID_OFFSET * PX_PER_UNIT);
const GRID_SECTION = [1 * PX_PER_UNIT, 3 * PX_PER_UNIT, 5 * PX_PER_UNIT, 7 * PX_PER_UNIT, 9 * PX_PER_UNIT];

const HIGHLIGHT_RADIUS = 10;

const MARGIN = {
 CHART: {X: 60, Y:30},
 AXIS_Y: 50,
 AXIS_Y_TEXT: -10
};

var constant = {
 CHART_HEIGHT: CHART_HEIGHT,
 OFFSETTED_HEIGHT: OFFSETTED_HEIGHT,
 GRID_SECTION: GRID_SECTION,
 HIGHLIGHT_RADIUS: HIGHLIGHT_RADIUS
};

var attributes = {

 margin: MARGIN,
 constant: constant,

 width: function() {
  return parseInt(d3.select('#chart').style('width'), 10) - WIDTH_OFFSET;
 },
 
 parseDate: function(date) {
  let parse = d3.timeParse("%Y-%m-%d");
  return parse(date);
 },

 currentDate: function() {
  let date = new Date();
  return date;
 },

 oneYearAgo: function() {
  let date = String(this.currentDate()).split(' ');
  date[3] -= 1;
  date = date.join(' ');
  return new Date(date);
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


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var socket = io.connect('https://stocktracker-eskaine.c9users.io/');
var ajax = __webpack_require__(2);
var dom = __webpack_require__(3);
var property = __webpack_require__(0);
var draw = __webpack_require__(4);

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


/***/ }),
/* 2 */
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
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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


/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*Reference
https://bl.ocks.org/mbostock/3902569
*/
var tempData;

var property = __webpack_require__(0);
var constant = property.constant;
var margin = property.margin;

var height = constant.CHART_HEIGHT;

var svg = d3.select('svg')
    .attr('transform', 'translate(' + margin.CHART.X + ',' + margin.CHART.Y + ')');

var canvas = svg.append('g')
    .attr('transform', 'translate(' + margin.AXIS_Y + ',0)')
    .attr('id', 'chart-group');

var tooltipGroup = svg.append('g')
    .attr('transform', 'translate(' + margin.AXIS_Y + ',0)')
    .attr('id', 'tooltip-group');

var linegroup, gridgroup, scanline, overlay;

var parseDate = d3.timeParse("%Y-%m-%d");

var x = d3.scaleTime();
var y = d3.scaleLinear().range([0, constant.OFFSETTED_HEIGHT]);

var axisX = d3.axisBottom(x)
    .tickFormat(d3.timeFormat("%b %y"))
    .tickSizeOuter(0);

var axisY = d3.axisLeft(y)
    .tickSize(0)
    .ticks(5);

var line = d3.line()
    .x(function(d) { return x(new Date(d.date)); })
    .y(function(d) { return y(d.price); });


var bisectDate = d3.bisector(function(d) { console.log(d); return d.date; }).left;

var draw = {

    axisX: function() {
        let width = property.width();

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
        x.domain([property.oneYearAgo(), property.currentDate()])
            .range([0, width]);
        axisX.ticks(d3.timeMonth.every(property.monthsPerTick()));

        //draw axis x
        canvas.append('g')
            .attr('class', 'axisX')
            .attr("transform", "translate(0," + constant.CHART_HEIGHT + ")")
            .call(axisX);
    },

    axisY: function() {
        y.domain([property.priceCap(), property.priceOffset()]);
        canvas.append('g')
            .attr('class', 'axisY')
            .attr("transform", "translate(" + margin.AXIS_Y_TEXT + ",0)")
            .call(axisY);
    },

    checkAxisY: function(data) {
        //get highest price in data
        let newMax = d3.max(data);
        newMax = parseFloat(newMax.price);

        let currentMaxPrice = parseFloat(property.getMaxPrice());

        //determine if axis y needs to be redraw
        if (newMax > currentMaxPrice) {
            property.setMaxPrice(newMax);

            if (document.querySelector('.axisY')) {
                let cY = document.querySelector('.axisY');
                document.querySelector('#chart-group').removeChild(cY);
            }

            this.axisY();
        }
    },

    //draw chart without data
    baseChart: function() {
        linegroup = canvas.append('g')
            .attr('id', 'line-group');

        gridgroup = canvas.append('g')
            .attr('id', 'grid-group');

        //draw vertical line
        scanline = tooltipGroup.append('line')
            .attr('class', 'scanline')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', height);

        //set overlay
        overlay = tooltipGroup.append('rect')
            .attr('class', 'overlay')
            .attr('width', property.width())
            .attr('height', height)



        overlay.on('mouseover', function(d) {
                tooltipGroup.selectAll('.focus')
                    .style('opacity', 1);
                scanline.style('opacity', 1);
            })

            .on('mousemove', function(d) {
                let width_automargin = (screen.width - parseInt(d3.select('#chart').style('width'), 10)) / 2;
                let x_pos = d3.event.pageX - margin.CHART.X - width_automargin - margin.AXIS_Y;
                scanline
                    .attr('x1', x_pos)
                    .attr('x2', x_pos);
                //console.log('mouse move');
                //console.log(d);
                if (sessionStorage.keys) {
                    console.log('bisecting');
                    let keys = JSON.parse(sessionStorage.keys);
                    let mouse = d3.mouse(this)[0];
                    // console.log(mouse);
                    keys.forEach(function(key) {

                        let data = JSON.parse(sessionStorage[key]);

                        d3.json(data, function(err, result) {
                            //console.log(result[0]);
                            // console.log(typeof data[0].date);
                            var x0 = x.invert(mouse);
                            //var i = bisectDate(data, x0, 1),
                            var i = d3.bisectLeft(result, new Date(x0).toISOString(), 1),
                                d0 = result[i - 1],
                                d1 = result[i],
                                d = x0 - d0.date > d1.date - x0 ? d1 : d0;


                            console.log(x0);
                            console.log(i);
                            console.log(d0);
                            tooltipGroup.select('#' + key + '_FOCUS')
                                .attr("transform", "translate(" + x(d.date) + "," + y(d.price) + ")");
                        });




                    });
                }
            })
            .on('mouseout', function(d) {
                tooltipGroup.selectAll('.focus')
                    .style('opacity', 0);
                scanline.style('opacity', 0);
            });






        //draw axis
        this.axisX();
        this.axisY();
    },

/*
    stock: function(dataset) {
        
        this.checkY(dataset[0].data);

        if (document.querySelector('#' + dataset.stockcode + '_CHART')) {
            let linechart = document.querySelector('#' + dataset.stockcode + '_CHART');
            document.querySelector('#line-group').removeChild(linechart);
        }

        linegroup.append("path")
            .datum(dataset[0].data)
            .attr('id', dataset.stockcode + '_CHART')
            .attr('class', 'line')
            .attr('d', line);


        /*
                if (!document.querySelector('#' + stockcode + '_FOCUS')) {
                    tooltipGroup.append('g')
                        .attr('id', stockcode + '_FOCUS')
                        .attr('class', 'focus')
                        .append('circle');
                }
        */

    /*},*/


    lineChart: function(dataset) {
        var datasets;

        if (dataset) {
            //store data for resize purposes
            tempData = dataset;
            datasets = d3.nest().entries(dataset);
        }
        else {
            datasets = d3.nest().entries(tempData);
        }

        //clear existing line
        if (document.querySelector('#line-group').hasChildNodes()) {
            document.querySelector('#line-group').innerHTML = '';
        }

        //draw line chart
        if (datasets) {
            var paths = linegroup.selectAll('.stockitem').data(datasets);
            paths.enter().append("path")
                .datum(function(d) {
                    //redraw axis y if necessary
                    draw.checkAxisY(d.data);
                    return d;
                })
                .attr('id', function(d) {
                    return d._id + '_CHART';
                })
                .attr('class', 'line')
                .attr('d', function(d) {
                    return line(d.data);
                });
        }
    }



};




module.exports = draw;


/***/ })
/******/ ]);