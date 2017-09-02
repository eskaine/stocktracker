'use strict';

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
