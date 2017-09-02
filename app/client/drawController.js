'use strict';

var attr = require('./attrController');
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