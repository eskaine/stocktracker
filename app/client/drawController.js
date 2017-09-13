'use strict';

/*Reference
https://bl.ocks.org/mbostock/3902569
*/
var tempData;

var property = require('./attrController');
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
