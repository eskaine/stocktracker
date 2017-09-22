'use strict';

/*Reference
https://bl.ocks.org/mbostock/3902569
*/

var dom = require('./domController');
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

var linegroup = canvas.append('g')
    .attr('id', 'line-group');



var gridgroup = canvas.append('g')
    .attr('id', 'grid-group');

var tooltipGroup = svg.append('g')
    .attr('transform', 'translate(' + margin.AXIS_Y + ',0)')
    .attr('id', 'tooltip-group');


//var tooltip = tooltipGroup.append('g')
var tooltip = d3.select('body').append('g')
    .attr('id', 'tooltip')
    .style('display', 'none');

var tipDate = tooltip.append('div')
    .attr('id', 'tip-date');

var tipStocks = tooltip.append('div')
    .attr('id', 'tip-group');

var focusGroup = tooltipGroup.append('g')
    .attr('id', 'focus-group')
    .style('display', 'none');



//draw vertical line
var scanline = tooltipGroup.append('line')
    .attr('class', 'scanline')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', height)
    .style('display', 'none');

//set overlay
var overlay = tooltipGroup.append('rect')
    .attr('class', 'overlay')
    .attr('width', property.width())
    .attr('height', height)





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


var bisectDate = d3.bisector(function(d) { return d.date; }).left;

var draw = {

    getTemp: function() {
        console.log(tempData);

    },

    axisX: function() {
        let width = property.width();

        //remove existing grid
        dom.clearGrid();

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

        //clear axis x
        dom.clearAxisX();

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

            //clear axis y
            dom.clearAxisY();

            //draw axis y
            this.axisY();
        }
    },

    //draw chart without data
    baseChart: function() {


        //draw axis
        this.axisX();
        this.axisY();
    },


    lineChart: function(dataset) {
        var data = nestData(dataset);


        //clear existing line
        if (document.querySelector('#line-group').hasChildNodes()) {
            document.querySelector('#line-group').innerHTML = '';
        }

        //draw line chart
        if (data) {
            var paths = linegroup.selectAll('.line').data(data);
            paths.enter().append("path")
                .datum(function(d) {
                    draw.checkAxisY(d.data);
                    return d;
                })
                .attr('id', function(d) {
                    return d._id + '_CHART';
                })
                .attr('class', 'line')
                .style('stroke', function(d, i) {
                    return constant.COLORS[i];
                })
                .attr('d', function(d, i) {
                    return line(d.data);
                });


        }


    },


    tips: function(dataset) {
        var data = nestData(dataset);
        
      //  dom.clearFocus();

        if (data) {

            //draw focuses
            var focuses = focusGroup.selectAll('.circle').data(data);
            focuses.enter().append('circle')
                .datum(function(d) {
                    return d;
                })
                .attr('id', function(d) {
                    return d._id + '_FOCUS';
                })
                .style('fill', function(d, i) {
                    return constant.COLORS[i];
                });

            //create text container
            dom.generateTips(data);



            overlay.on('mouseover', function(d) {

                    scanline.style('display', null);


                    focusGroup.style('display', null);
                    tooltip.style('display', null);
                })


                .on('mousemove', function(d) {
                    let xDate = d3.mouse(this)[0];
                    xDate = x.invert(xDate);
                    xDate = new Date(xDate.toDateString());
                    let mouseX = d3.event.pageX;
                    let mouseY = d3.event.pageY;

                    setFocus(xDate, data)
                        .then(function fulfilled() {

                            let width_automargin = (screen.width - parseInt(d3.select('#chart').style('width'), 10)) / 2;
                            let x_pos = mouseX - margin.CHART.X - width_automargin - margin.AXIS_Y;
                            scanline
                                .attr('x1', x_pos)
                                .attr('x2', x_pos);
                                console.log(x_pos);

                            let chartEnd = width_automargin + margin.CHART.X + margin.AXIS_Y + property.width();
                       //     console.log(chartEnd);
                            console.log(mouseX);

                            if ((chartEnd - mouseX) < constant.TOOLTIP_FLIP_THRESHOLD) {
                                tooltip.style("left", (mouseX + margin.TOOLTIP.leftX) + "px");
                            }
                            else {
                                tooltip.style("left", (mouseX + margin.TOOLTIP.X) + "px");
                            }


                            tooltip.style("top", mouseY + "px")
                                .style('display', null);

                            tipDate.text(xDate.toDateString());

                        }, function rejected() {
                            //     tooltip.style('display', 'none');
                            //console.log('rejected');
                        });

                })
                .on('mouseout', function(d) {
                    //  draw.clearTips();
                    scanline.style('display', 'none');

                    focusGroup.style('display', 'none');
                    tooltip.style('display', 'none');
                });
        }


    },





};




module.exports = draw;




function nestData(dataset) {
    if (dataset) {
        //store data for resize purposes
        tempData = dataset;
        return d3.nest().entries(dataset);
    }
    else {
        return d3.nest().entries(tempData);
    }
}

function setFocus(mouseDate, dataset) {

    return new Promise(function(resolve, reject) {
        let noDataCount = 0;



        //reset focus display
        tooltipGroup.selectAll('circle')
            .attr('display', null);

        dataset.forEach(function(data, i) {
            console.log('set focus');
            console.log(data);
            
            data.data.sort(function(a, b) {
                return a.date - b.date;
            });

            var index = bisectDate(data.data, mouseDate);
            var d0 = data.data[index - 1];
            var d1 = data.data[index];

            if (mouseDate.getTime() <= data.data[data.data.length - 1].date.getTime() && mouseDate.getTime() === d1.date.getTime()) {
                let d = mouseDate - d0.date > d1.date - mouseDate ? d1 : d0;
                tooltipGroup.select('#' + data._id + '_FOCUS')
                    .attr("transform", "translate(" + x(d.date) + "," + y(d.price) + ")");

                let spanText = tipStocks.select('#' + data._id + '_TIP')
                    .style('color', constant.COLORS[i])
                    .text(data._id);

                spanText.append('span')
                    .attr('class', 'span-text')
                    .text(' ' + d.price);
            }
            else {

                if (mouseDate.getTime() > data.data[data.data.length - 1].date.getTime()) {
                    tipStocks.select('#' + data._id + '_TIP')
                        .text('');


                    tooltipGroup.select('#' + data._id + '_FOCUS')
                        .attr('display', 'none');
                        
                  

                }



                noDataCount++;
            }


            if (i === dataset.length - 1) {
                if (noDataCount === dataset.length) {

                    reject();
                }
                else {

                    resolve();
                }
            }



        });
    });





}
