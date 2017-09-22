'use strict';

var mostRecentDate = 0;
var oneYearAgoDate;

const CHART_HEIGHT = 300;

const COLORS = [{ color: '#1abc9c' }, { color: '#9b59b6' }, { color: '#2ecc71' }, { color: '#ffd740' }, { color: '#e67e22' }, { color: '#e74c3c' }];
const DEFAULT_COLOR = '#15a4fa';

//axis x
const MONTHS_PER_YEAR = 12;
const AXIS_X_PX_PER_TICK = 100;
const WIDTH_OFFSET = 180;
const TOOLTIP_FLIP_THRESHOLD = 150;

//axis y 
const HEIGHT_SECTION = 5;
const DOLLARS_PER_TIER = 250;
var pricePerSection = 0;
var maxPrice = 0;
var priceCap = 0;

//grid
const PX_PER_UNIT = 30;
const GRID_SECTION = [0 * PX_PER_UNIT, 2 * PX_PER_UNIT, 4 * PX_PER_UNIT, 6 * PX_PER_UNIT, 8 * PX_PER_UNIT];

const MARGIN = {
 CHART: { X: 100, Y: 50 },
 TOOLTIP: { X: 20, leftX: -130 },
 FOCUS: 2
};

var property = {

 HEIGHT: CHART_HEIGHT,
 COLORS: COLORS,
 GRID_SECTION: GRID_SECTION,
 TOOLTIP_FLIP_THRESHOLD: TOOLTIP_FLIP_THRESHOLD,
 margin: MARGIN,

 width: function() {
  return parseInt(d3.select('#chart').style('width'), 10) - WIDTH_OFFSET;
 },

 tickValues: function() {
  return [1 * pricePerSection, 2 * pricePerSection, 3 * pricePerSection, 4 * pricePerSection, 5 * pricePerSection];
 },

 setDate: function(date) {
  mostRecentDate = date;

  let oldDate = new Date(date).toDateString();
  oldDate = oldDate.split(' ');
  oldDate[2] -= 1;
  oldDate[3] -= 1;
  oldDate = oldDate.join(' ');
  oneYearAgoDate = new Date(oldDate).getTime();
 },

 currentDate: function() {
  return mostRecentDate;
 },

 oneYearAgo: function() {
  return oneYearAgoDate;
 },

 monthsPerTick: function() {
  let totalTick = Math.floor(this.width() / AXIS_X_PX_PER_TICK);
  return Math.floor(MONTHS_PER_YEAR / totalTick);
 },

 setMaxPrice: function(price) {
  maxPrice = price;
  priceCap = Math.ceil(maxPrice / DOLLARS_PER_TIER) * DOLLARS_PER_TIER;
  pricePerSection = priceCap / HEIGHT_SECTION;
 },

 getMaxPrice: function() {
  return maxPrice;
 },

 priceCap: function() {
  return priceCap;
 },

 assignColor: function() {
  for (var i in COLORS) {

   if (!COLORS[i].isAssign) {
    COLORS[i].isAssign = true;
    return COLORS[i].color;
   }

   if (i == COLORS.length - 1) {
    return DEFAULT_COLOR;
   }
  }
 },

 removeColor: function(color) {
  for (var i in COLORS) {
   if (COLORS[i].color === color) {
    COLORS[i].isAssign = false;
    break;
   }
  }
 }

};

module.exports = property;
