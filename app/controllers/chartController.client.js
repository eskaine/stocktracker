'use strict';

var stockChart = (function() {

    var apiUrl = appUrl + '/list';
    var canvas = d3.select('svg');

    function onloadGenerate(stocklist) {
        stocklist.forEach(function(stockcode) {
            generateStockPanel(stockcode);
        });
    }

    function generateChartBase() {
        document.querySelector('svg').innerHTML = '';
        var chartWidth = currentWidth() - WIDTH_OFFSET;
        var tick = monthsPerTick();

        var x = d3.scaleTime()
            .domain([new Date(oneYearAgo), new Date(currentDate)])
            .range([0, chartWidth]);


        var y = d3.scaleLinear()
            .domain([MAX_STOCK_PRICE, Y_DOMAIN_OFFSET])
            .range([0, CHART_HEIGHT - Y_RANGE_OFFSET]);

        var axisX = d3.axisBottom(x)
            .tickFormat(d3.timeFormat("%b %y"))
            .tickSizeOuter(0)
            .ticks(d3.timeMonth.every(tick));

        var axisY = d3.axisLeft(y)
            .tickSize(0)
            .ticks(5);

        var chart = canvas.append('g')
            .attr('transform', 'translate(' + CHART.MARGIN.X + ',' + CHART.MARGIN.Y + ')');

        var charting = chart.selectAll('line')
            .data(chartingHeight)
            .enter()
            .append('line')
            .attr('stroke', '#384d67')
            .attr('x1', 0)
            .attr('y1', function(d) { return d; })
            .attr('x2', chartWidth)
            .attr('y2', function(d) { return d; });

        chart.append('g')
            .attr('class', 'axisX')
            .attr("transform", "translate(0," + CHART_HEIGHT + ")")
            .call(axisX);

        chart.append('g')
            .attr('class', 'axisY')
            .call(axisY);
    }
   

    ajaxFunctions.ready(generateChartBase);

    ajaxFunctions.ready(

        ajaxFunctions.ajaxRequest('GET', apiUrl, function(result) {
            result = JSON.parse(result);
            // console.log(result.list);
            onloadGenerate(result.list);
        })
    );

    d3.select(window).on('resize', generateChartBase);

})();
