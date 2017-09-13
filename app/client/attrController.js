'use strict';

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
