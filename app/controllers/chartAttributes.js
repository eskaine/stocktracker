'use strict';


 var currentDate = new Date();
 currentDate = currentDate.toDateString();
 currentDate = currentDate.split(' ');
 currentDate.shift();
 currentDate = currentDate.join(' ');

 var oneYearAgo = currentDate;
 oneYearAgo = oneYearAgo.split(' ');
 oneYearAgo[2] -= 1;
 oneYearAgo = oneYearAgo.join(' ');


 //unit measurements
 const NUM_OF_Y_UNIT = 11;
 const US_DOLLARS_PER_UNIT = 100;
 const PX_PER_UNIT = 30;

 //charting measurements
 //left to right -> top to bottom, 5 sections of y
 const chartingHeight = [1 * PX_PER_UNIT, 3 * PX_PER_UNIT, 5 * PX_PER_UNIT, 7 * PX_PER_UNIT, 9 * PX_PER_UNIT];
 const Y_RANGE_OFFSET = 2 * PX_PER_UNIT;
 const Y_DOMAIN_OFFSET = 2 * US_DOLLARS_PER_UNIT;
 //const NUM_OF_SECTION = 4;

 //chart/svg metrics
 const MAX_STOCK_PRICE = NUM_OF_Y_UNIT * US_DOLLARS_PER_UNIT;
 const CANVAS_SIZE = {
     WIDTH: 1000,
     HEIGHT: 500
 };

 const CHART = {
     MARGIN: {
         X: 85,
         Y: 30
     }
 };
 
 const CHART_HEIGHT = NUM_OF_Y_UNIT * PX_PER_UNIT;
 
 
 const TICKS_PER_YEAR = 12;
 const X_PX_PER_TICK = 100;
const WIDTH_OFFSET = 180; 

 function currentWidth() {
  return parseInt(d3.select('#chart').style('width'), 10);
 }
 
 function monthsPerTick(){
  let totalTick = Math.floor(currentWidth() / X_PX_PER_TICK);
 
  return Math.floor(TICKS_PER_YEAR / totalTick);
 }