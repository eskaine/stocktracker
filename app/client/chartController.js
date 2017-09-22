'use strict';

/*Reference
https://bl.ocks.org/mbostock/3902569
*/

var dom = require('./domController');
var storedData = [];

var property = require('./propertyController');
var margin = property.margin;


var x = d3.scaleTime();
var y = d3.scaleLinear()
    .range([0, property.HEIGHT]);

var axisX = d3.axisBottom(x)
    .tickFormat(d3.timeFormat("%b %y"))
    .tickSizeOuter(0)
    .ticks(d3.timeMonth.every(property.monthsPerTick()));

var axisY = d3.axisLeft(y)
    .tickSize(0);

var svg = d3.select('svg').append('g')
    .attr('transform', 'translate(' + margin.CHART.X + ',' + margin.CHART.Y + ')');

var canvas = svg.append('g')
    .attr('id', 'chart-group');

var lineGroup = canvas.append('g')
    .attr('id', 'line-group');

var gridGroup = canvas.append('g')
    .attr('id', 'grid-group');

var tooltipGroup = svg.append('g')
    .attr('id', 'tooltip-group');

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


var scanline = tooltipGroup.append('line')
    .attr('id', 'scanline')
    .attr('x1', 0)
    .attr('y1', 0)
    .attr('x2', 0)
    .attr('y2', property.HEIGHT)
    .style('display', 'none');

var overlay = tooltipGroup.append('rect')
    .attr('class', 'overlay')
    .attr('width', property.width())
    .attr('height', property.HEIGHT)

overlay.on('mouseover', function(d) {
        if (storedData.length > 0) {



            scanline.style('display', null);
            focusGroup.style('display', null);
            tooltip.style('display', null);
        }
    })
    .on('mousemove', function(d) {

        if (storedData.length > 0) {

            let xDate = d3.mouse(this)[0];
            xDate = x.invert(xDate);
            xDate = new Date(xDate.toDateString());
            let mouseX = d3.event.pageX;
            let mouseY = d3.event.pageY;

            setFocus(xDate)
                .then(function fulfilled() {

                    let width_automargin = (screen.width - parseInt(d3.select('#chart').style('width'), 10)) / 2;
                    let x_pos = mouseX - width_automargin - margin.CHART.X;
                    scanline
                        .attr('x1', x_pos)
                        .attr('x2', x_pos);

                    let chartEnd = width_automargin + margin.CHART.X + property.width();

                    if ((chartEnd - mouseX) < property.TOOLTIP_FLIP_THRESHOLD)
                        tooltip.style("left", (mouseX + margin.TOOLTIP.leftX) + "px");
                    else
                        tooltip.style("left", (mouseX + margin.TOOLTIP.X) + "px");


                    tooltip.style("top", mouseY + "px")
                        .style('display', null);

                    tipDate.text(xDate.toDateString());
                });
        }
    })
    .on('mouseout', function(d) {
        if (storedData.length > 0) {
            scanline.style('display', 'none');
            focusGroup.style('display', 'none');
            tooltip.style('display', 'none');
        }
    });

var line = d3.line().defined(function(d) {
        return d.date.getTime() > property.oneYearAgo();
    })
    .x(function(d) {
        return x(new Date(d.date));
    })
    .y(function(d) {
        return y(d.price);
    });

var parseDate = d3.timeParse("%Y-%m-%d");
var bisectDate = d3.bisector(function(d) { return d.date; }).left;

var chart = {

    //refactor
    parseData: function(result) {
        return new Promise(function(resolve) {
            result.forEach(function(stock, i) {

                //assign colors
                result[i].color = property.assignColor();

                stock.data.forEach(function(d, j) {
                    d.date = parseDate(d.date);
                    d.price = parseFloat(d.price);

                    //replace original data array with parsed data array
                    if (j === stock.data.length - 1)
                        //save data
                        storedData.push(result[i]);

                    if (i === result.length - 1 && j === stock.data.length - 1)
                        resolve(result);
                });
            });
        });
    },

    drawAxis: function(dataset) {
        return new Promise(function(resolve, reject) {

            if (!dataset) {
                dataset = storedData;
            }

            //get latest date(axis x)
            let latestDate = d3.max(dataset, function(d) {
                if (d.data[d.data.length - 1].date.getTime() > d.data[0].date.getTime())
                    return d.data[d.data.length - 1].date.getTime();
                else
                    return d.data[0].date.getTime();
            });

            let highest = { 'price': 0 };

            //get highest price(axis y)
            let highestPrice = d3.max(dataset, function(data) {

                let price = d3.max(data.data, function(d) {
                    return d.price;
                });

                if (price > highest.price) {
                    highest.price = price;
                    highest.stockcode = data._id;
                }

                return price;
            });

            //draw grid lines
            drawGrid();

            let currentDate = property.currentDate();

            //check x
            if (latestDate > currentDate || latestDate < currentDate && storedData.length === 1) {
                //set x cap
                property.setDate(latestDate);
                drawX();
            }

            let currentPrice = property.getMaxPrice();
            //check y
            if (highestPrice > currentPrice) {
                //set highest in stored data
                setHighestStock(highest.stockcode);
                //set y cap
                property.setMaxPrice(highestPrice);
                drawY();
            }

            //line chart draw check
            if (latestDate > currentDate || highestPrice > currentPrice || latestDate < currentDate && storedData.length === 1)
                return resolve(true);
            else
                return resolve(false);
        });
    },

    drawStock: function(dataset) {
        drawLine(dataset);
        this.drawFocus(dataset);
        dom.addTip(dataset._id);
        dom.addPanel(dataset._id);
    },

    drawFocus: function(data) {
        //draw focuses
        focusGroup.append('circle')
            .datum(data)
            .attr('id', function(d) {
                return d._id + '_FOCUS';
            })
            .style('fill', function(d) {
                return d.color;
            });
    },

    redrawChart: function() {
        //clear chart
        lineGroup.html('');
        //draw chart
        for (var i in storedData) {
            drawLine(storedData[i]);
        }
    },

    deleteData: function(stockcode) {
        return new Promise(function(resolve, reject) {

            d3.select('#' + stockcode + '_CHART').remove();
            dom.deletePanel(stockcode);
            dom.deleteTip(stockcode);
            
            for (var i in storedData) {
                if (storedData[i]._id === stockcode) {
                    //delete data from stored data
                    let d = storedData.splice(i, 1);
                    //remove color assignment
                    property.removeColor(d[0].color);

                    if (storedData.length === 0) {
                        d3.select('#axisX').remove();
                        d3.select('#axisY').remove();
                        gridGroup.html('');
                        property.setDate(0);
                        property.setMaxPrice(0);
                        return null;
                    }
                    else {
                        //redraw axes and chart if deleted stock is current highest
                        if (d[0].isHighest)
                            return resolve(true);
                        else
                            return resolve(false);
                    }
                }
            }
        });
    }

};

module.exports = chart;

function drawGrid() {
    //remove existing grid
    gridGroup.html('');
    //draw grid
    gridGroup.selectAll('line')
        .data(property.GRID_SECTION)
        .enter()
        .append('line')
        .attr('stroke', '#384d67')
        .attr('x1', 0)
        .attr('y1', function(d) { return d; })
        .attr('x2', property.width())
        .attr('y2', function(d) { return d; });
}

function drawX() {
    //clear axis x
    d3.select('#axisX').remove();
    //prepare x
    x.domain([property.oneYearAgo(), property.currentDate()])
        .range([0, property.width()]);
    //draw x
    canvas.append('g')
        .attr('id', 'axisX')
        .attr("transform", "translate(0," + property.HEIGHT + ")")
        .call(axisX);
}

function drawY() {
    //clear axis y
    d3.select('#axisY').remove();
    //prepare y
    y.domain([property.priceCap(), 0]);
    axisY.tickValues(property.tickValues());
    // draw y
    canvas.append('g')
        .attr('id', 'axisY')
        .call(axisY);
}



function drawLine(data) {
    lineGroup.append("path")
        .datum(data)
        .attr('id', function(d) {
            return d._id + '_CHART';
        })
        .attr('class', 'line')
        .style('stroke', function(d) {
            return d.color;
        })
        .attr('d', function(d, i) {
            return line(d.data);
        });
}

function setHighestStock(stockcode) {
    for (var i in storedData) {
        if (storedData[i]._id === stockcode) {
            storedData[i].isHighest = true;
        }
        else {
            storedData[i].isHighest = false;
        }
    }
}

function setFocus(mouseDate) {
    return new Promise(function(resolve, reject) {
        let noDataCount = 0;
        //reset focus display
        tooltipGroup.selectAll('circle')
            .attr('display', null);

        storedData.forEach(function(data, i) {

            data.data.sort(function(a, b) {
                return a.date - b.date;
            });

            let index = bisectDate(data.data, mouseDate);
            let d0 = data.data[index - 1];
            let d1 = data.data[index];

            if (mouseDate.getTime() <= data.data[data.data.length - 1].date.getTime() && mouseDate.getTime() === d1.date.getTime()) {
                let d;

                if (mouseDate - d0.date > d1.date - mouseDate)
                    d = d1
                else
                    d = d0;

                //let d = mouseDate - d0.date > d1.date - mouseDate ? d1 : d0;
                tooltipGroup.select('#' + data._id + '_FOCUS')
                    .attr("transform", "translate(" + (x(d.date) + property.margin.FOCUS) + "," + y(d.price) + ")");

                let spanText = tipStocks.select('#' + data._id + '_TIP')
                    .style('color', data.color)
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

            if (i === storedData.length - 1) {
                if (noDataCount !== storedData.length)
                    resolve();
            }
        });
    });
}
