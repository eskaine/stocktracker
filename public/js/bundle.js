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
/******/ 	return __webpack_require__(__webpack_require__.s = 2);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


var addButton = document.querySelector('#add-btn');
var panelGroup = document.querySelector('#panel-group');

var dom = {

    addPanel: function(stockcode) {
        createPanel(stockcode);
    },
    
    addTip: function(stockcode) {
        let tipStocks = document.querySelector('#tip-group');
        let tipBox = document.createElement('div');
        tipBox.setAttribute('id', stockcode + '_TIP');
        tipStocks.appendChild(tipBox);
    },

    deletePanel: function(stockcode) {
        let panel = document.querySelector('#' + stockcode);
        panelGroup.removeChild(panel);
    },

    deleteTip: function(stockcode) {
        let focusGroup = document.querySelector('#focus-group');
        let focus = document.querySelector('#' + stockcode + '_FOCUS');
        focusGroup.removeChild(focus);

        let tipGroup = document.querySelector('#tip-group');
        let tip = document.querySelector('#' + stockcode + '_TIP');
        tipGroup.removeChild(tip);
    },
};

module.exports = dom;

function createPanel(stockcode) {
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
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


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


/***/ }),
/* 2 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(3);

var socket = io.connect('https://stocktracker-eskaine.c9users.io/');
var ajax = __webpack_require__(8);
var dom = __webpack_require__(0);
var property = __webpack_require__(1);
var chart = __webpack_require__(9);

var input = document.querySelector('#input');
var url = window.location.origin + '/list';
(function() {
    
    //onload
    ajax.ready(function() {
        ajax.ajaxRequest('GET', url, function(result) {
            onLoad(result)
        });
    });

    socket.on('add', function(result) {
        onAdd(result);
    });

    socket.on('delete', function(result) {
        onDelete(result);
    });

    socket.on('invalid', function(result) {
        input.placeholder = result;
    });

    //enter keypress
    input.addEventListener('keypress', function(e) {
        if (e.keyCode === 13) {
            emitData();
        }
    });

    document.querySelector('#add-btn').addEventListener('click', function() {
        emitData();
    });

    //close/delete stock
    document.addEventListener('click', function(e) {
        if (e.target.parentElement.className === 'close') {
            socket.emit('delete', e.target.parentElement.parentElement.id.toUpperCase());
        }
    });
})();

function emitData() {
    input.placeholder = 'Stockcode';

    //check stock is already listed
    if (document.querySelector('#' + input.value.toUpperCase())) {
        input.value = '';
    }
    else if (input.value) {
        socket.emit('add', input.value.toUpperCase());
        input.value = '';
    }
}

function onLoad(result) {
    if (result) {
        let dataset;
        result = JSON.parse(result);
        
        chart.parseData(result)
            .then(function fulfilled(parsedData) {
                dataset = parsedData;
                chart.drawAxis(parsedData);
            })
            .then(function fulfilled() {
                for (var i in dataset) {
                    chart.drawStock(dataset[i]);
                }
            });
    }
}

function onAdd(result) {
    let dataset;
    chart.parseData(result)
        .then(function fulfilled(parsedData) {
            dataset = parsedData;
            return chart.drawAxis(parsedData);
        })
        .then(function fulfilled(redraw) {
            if (redraw) {
                chart.redrawChart();
                chart.drawFocus(dataset[0]);
                dom.addTip(dataset[0]._id);
                dom.addPanel(dataset[0]._id);
            }
            else {
                chart.drawStock(dataset[0]);
            }
           
        });
}

function onDelete(stockcode) {
    chart.deleteData(stockcode)
        .then(function fulfilled(isHighest) {

            if (isHighest) {
                //reset current max price
                property.setMaxPrice(0);

                chart.drawAxis()
                    .then(function fulfilled() {
                        chart.redrawChart();
                    });
            }
        });
}


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


__webpack_require__(4);

/***/ }),
/* 4 */
/***/ (function(module, exports, __webpack_require__) {

// style-loader: Adds some css to the DOM by adding a <style> tag

// load the styles
var content = __webpack_require__(5);
if(typeof content === 'string') content = [[module.i, content, '']];
// Prepare cssTransformation
var transform;

var options = {}
options.transform = transform
// add the styles to the DOM
var update = __webpack_require__(6)(content, options);
if(content.locals) module.exports = content.locals;
// Hot Module Replacement
if(false) {
	// When the styles change, update the <style> tags
	if(!content.locals) {
		module.hot.accept("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./styles.scss", function() {
			var newContent = require("!!../../node_modules/css-loader/index.js!../../node_modules/sass-loader/lib/loader.js!./styles.scss");
			if(typeof newContent === 'string') newContent = [[module.id, newContent, '']];
			update(newContent);
		});
	}
	// When the module is disposed, remove the <style> tags
	module.hot.dispose(function() { update(); });
}

/***/ }),
/* 5 */
/***/ (function(module, exports, __webpack_require__) {

exports = module.exports = __webpack_require__(10)(undefined);
// imports


// module
exports.push([module.i, "body {\n  background-color: #384d67; }\n\n#app {\n  width: 100%;\n  margin: 0 auto;\n  margin-top: 5em;\n  display: grid;\n  grid-gap: 1em; }\n\n.panel {\n  border: 0;\n  background-color: #1c324a; }\n\n.panel-heading {\n  background-color: #15a4fa; }\n\n.panel-title {\n  font-size: 30px;\n  font-weight: bold; }\n\n.panel-body {\n  padding: 0; }\n\n#panel-group {\n  width: 100%;\n  margin: 0 auto;\n  padding: 0;\n  display: grid;\n  grid-row-gap: 1em;\n  grid-column-gap: 2em;\n  grid-auto-rows: minmax(40px, auto); }\n\n/*chart*/\n.svg {\n  width: 100%;\n  height: 450px; }\n\n.line {\n  fill: none;\n  stroke: #1c324a;\n  stroke-width: 2;\n  stroke-linejoin: round;\n  stroke-linecap: round; }\n\n/*axes*/\n#axisX text {\n  font-size: 12px;\n  fill: #15a4fa; }\n\n#axisX line,\n#axisX path {\n  stroke: #384d67; }\n\n#axisY {\n  stroke-opacity: 0; }\n  #axisY text {\n    font-size: 12px;\n    fill: #15a4fa; }\n\n/*tooltip*/\n.overlay {\n  fill: none;\n  pointer-events: all; }\n\n#scanline {\n  stroke: #15a4fa;\n  stroke-width: 1; }\n\ncircle {\n  r: 7;\n  opacity: 0.6; }\n\n#tooltip {\n  z-index: 10px;\n  position: absolute;\n  background-color: rgba(56, 77, 103, 0.6);\n  color: #bdc3c7;\n  width: 110px;\n  border-radius: 5px;\n  border: 1px solid #15a4fa;\n  padding: 0.5em;\n  font-size: 10px; }\n\n#tip-date {\n  font-size: 12px; }\n\n.span-text {\n  color: #bdc3c7; }\n\n#highlight {\n  z-index: 10px; }\n\n/*buttons*/\n#add {\n  box-sizing: border-box;\n  height: 100%;\n  border-style: none;\n  cursor: pointer; }\n\n#add-btn {\n  height: 100%;\n  border-style: none; }\n\n#input {\n  height: 100%;\n  border-style: none;\n  background-color: #1c324a;\n  color: #15a4fa;\n  text-indent: 10px; }\n\n#add-btn {\n  background-color: #15a4fa;\n  color: #384d67;\n  padding: 0 2em 0 2em;\n  font-weight: bold; }\n\n.label-text {\n  text-indent: 10px; }\n\n.stock {\n  box-sizing: border-box;\n  position: relative;\n  background-color: #1c324a;\n  color: #15a4fa;\n  border-radius: 5px;\n  padding: 10px; }\n\n.close {\n  position: absolute;\n  top: 8px;\n  right: 10px; }\n\n.close-icon {\n  color: transparent; }\n\n::-webkit-input-placeholder {\n  color: #384d67; }\n\n::-moz-placeholder {\n  color: #384d67; }\n\n:-ms-input-placeholder {\n  color: #384d67; }\n\n:-moz-placeholder {\n  color: #384d67; }\n\n@media screen and (min-width: 768px) {\n  #panel-group {\n    grid-template-columns: 1fr 1fr; } }\n\n@media screen and (min-width: 992px) {\n  #app {\n    max-width: 1080px; }\n  #panel-group {\n    max-width: 1080px;\n    grid-template-columns: 1fr 1fr 1fr; } }\n", ""]);

// exports


/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/

var stylesInDom = {};

var	memoize = function (fn) {
	var memo;

	return function () {
		if (typeof memo === "undefined") memo = fn.apply(this, arguments);
		return memo;
	};
};

var isOldIE = memoize(function () {
	// Test for IE <= 9 as proposed by Browserhacks
	// @see http://browserhacks.com/#hack-e71d8692f65334173fee715c222cb805
	// Tests for existence of standard globals is to allow style-loader
	// to operate correctly into non-standard environments
	// @see https://github.com/webpack-contrib/style-loader/issues/177
	return window && document && document.all && !window.atob;
});

var getElement = (function (fn) {
	var memo = {};

	return function(selector) {
		if (typeof memo[selector] === "undefined") {
			memo[selector] = fn.call(this, selector);
		}

		return memo[selector]
	};
})(function (target) {
	return document.querySelector(target)
});

var singleton = null;
var	singletonCounter = 0;
var	stylesInsertedAtTop = [];

var	fixUrls = __webpack_require__(7);

module.exports = function(list, options) {
	if (typeof DEBUG !== "undefined" && DEBUG) {
		if (typeof document !== "object") throw new Error("The style-loader cannot be used in a non-browser environment");
	}

	options = options || {};

	options.attrs = typeof options.attrs === "object" ? options.attrs : {};

	// Force single-tag solution on IE6-9, which has a hard limit on the # of <style>
	// tags it will allow on a page
	if (!options.singleton) options.singleton = isOldIE();

	// By default, add <style> tags to the <head> element
	if (!options.insertInto) options.insertInto = "head";

	// By default, add <style> tags to the bottom of the target
	if (!options.insertAt) options.insertAt = "bottom";

	var styles = listToStyles(list, options);

	addStylesToDom(styles, options);

	return function update (newList) {
		var mayRemove = [];

		for (var i = 0; i < styles.length; i++) {
			var item = styles[i];
			var domStyle = stylesInDom[item.id];

			domStyle.refs--;
			mayRemove.push(domStyle);
		}

		if(newList) {
			var newStyles = listToStyles(newList, options);
			addStylesToDom(newStyles, options);
		}

		for (var i = 0; i < mayRemove.length; i++) {
			var domStyle = mayRemove[i];

			if(domStyle.refs === 0) {
				for (var j = 0; j < domStyle.parts.length; j++) domStyle.parts[j]();

				delete stylesInDom[domStyle.id];
			}
		}
	};
};

function addStylesToDom (styles, options) {
	for (var i = 0; i < styles.length; i++) {
		var item = styles[i];
		var domStyle = stylesInDom[item.id];

		if(domStyle) {
			domStyle.refs++;

			for(var j = 0; j < domStyle.parts.length; j++) {
				domStyle.parts[j](item.parts[j]);
			}

			for(; j < item.parts.length; j++) {
				domStyle.parts.push(addStyle(item.parts[j], options));
			}
		} else {
			var parts = [];

			for(var j = 0; j < item.parts.length; j++) {
				parts.push(addStyle(item.parts[j], options));
			}

			stylesInDom[item.id] = {id: item.id, refs: 1, parts: parts};
		}
	}
}

function listToStyles (list, options) {
	var styles = [];
	var newStyles = {};

	for (var i = 0; i < list.length; i++) {
		var item = list[i];
		var id = options.base ? item[0] + options.base : item[0];
		var css = item[1];
		var media = item[2];
		var sourceMap = item[3];
		var part = {css: css, media: media, sourceMap: sourceMap};

		if(!newStyles[id]) styles.push(newStyles[id] = {id: id, parts: [part]});
		else newStyles[id].parts.push(part);
	}

	return styles;
}

function insertStyleElement (options, style) {
	var target = getElement(options.insertInto)

	if (!target) {
		throw new Error("Couldn't find a style target. This probably means that the value for the 'insertInto' parameter is invalid.");
	}

	var lastStyleElementInsertedAtTop = stylesInsertedAtTop[stylesInsertedAtTop.length - 1];

	if (options.insertAt === "top") {
		if (!lastStyleElementInsertedAtTop) {
			target.insertBefore(style, target.firstChild);
		} else if (lastStyleElementInsertedAtTop.nextSibling) {
			target.insertBefore(style, lastStyleElementInsertedAtTop.nextSibling);
		} else {
			target.appendChild(style);
		}
		stylesInsertedAtTop.push(style);
	} else if (options.insertAt === "bottom") {
		target.appendChild(style);
	} else {
		throw new Error("Invalid value for parameter 'insertAt'. Must be 'top' or 'bottom'.");
	}
}

function removeStyleElement (style) {
	if (style.parentNode === null) return false;
	style.parentNode.removeChild(style);

	var idx = stylesInsertedAtTop.indexOf(style);
	if(idx >= 0) {
		stylesInsertedAtTop.splice(idx, 1);
	}
}

function createStyleElement (options) {
	var style = document.createElement("style");

	options.attrs.type = "text/css";

	addAttrs(style, options.attrs);
	insertStyleElement(options, style);

	return style;
}

function createLinkElement (options) {
	var link = document.createElement("link");

	options.attrs.type = "text/css";
	options.attrs.rel = "stylesheet";

	addAttrs(link, options.attrs);
	insertStyleElement(options, link);

	return link;
}

function addAttrs (el, attrs) {
	Object.keys(attrs).forEach(function (key) {
		el.setAttribute(key, attrs[key]);
	});
}

function addStyle (obj, options) {
	var style, update, remove, result;

	// If a transform function was defined, run it on the css
	if (options.transform && obj.css) {
	    result = options.transform(obj.css);

	    if (result) {
	    	// If transform returns a value, use that instead of the original css.
	    	// This allows running runtime transformations on the css.
	    	obj.css = result;
	    } else {
	    	// If the transform function returns a falsy value, don't add this css.
	    	// This allows conditional loading of css
	    	return function() {
	    		// noop
	    	};
	    }
	}

	if (options.singleton) {
		var styleIndex = singletonCounter++;

		style = singleton || (singleton = createStyleElement(options));

		update = applyToSingletonTag.bind(null, style, styleIndex, false);
		remove = applyToSingletonTag.bind(null, style, styleIndex, true);

	} else if (
		obj.sourceMap &&
		typeof URL === "function" &&
		typeof URL.createObjectURL === "function" &&
		typeof URL.revokeObjectURL === "function" &&
		typeof Blob === "function" &&
		typeof btoa === "function"
	) {
		style = createLinkElement(options);
		update = updateLink.bind(null, style, options);
		remove = function () {
			removeStyleElement(style);

			if(style.href) URL.revokeObjectURL(style.href);
		};
	} else {
		style = createStyleElement(options);
		update = applyToTag.bind(null, style);
		remove = function () {
			removeStyleElement(style);
		};
	}

	update(obj);

	return function updateStyle (newObj) {
		if (newObj) {
			if (
				newObj.css === obj.css &&
				newObj.media === obj.media &&
				newObj.sourceMap === obj.sourceMap
			) {
				return;
			}

			update(obj = newObj);
		} else {
			remove();
		}
	};
}

var replaceText = (function () {
	var textStore = [];

	return function (index, replacement) {
		textStore[index] = replacement;

		return textStore.filter(Boolean).join('\n');
	};
})();

function applyToSingletonTag (style, index, remove, obj) {
	var css = remove ? "" : obj.css;

	if (style.styleSheet) {
		style.styleSheet.cssText = replaceText(index, css);
	} else {
		var cssNode = document.createTextNode(css);
		var childNodes = style.childNodes;

		if (childNodes[index]) style.removeChild(childNodes[index]);

		if (childNodes.length) {
			style.insertBefore(cssNode, childNodes[index]);
		} else {
			style.appendChild(cssNode);
		}
	}
}

function applyToTag (style, obj) {
	var css = obj.css;
	var media = obj.media;

	if(media) {
		style.setAttribute("media", media)
	}

	if(style.styleSheet) {
		style.styleSheet.cssText = css;
	} else {
		while(style.firstChild) {
			style.removeChild(style.firstChild);
		}

		style.appendChild(document.createTextNode(css));
	}
}

function updateLink (link, options, obj) {
	var css = obj.css;
	var sourceMap = obj.sourceMap;

	/*
		If convertToAbsoluteUrls isn't defined, but sourcemaps are enabled
		and there is no publicPath defined then lets turn convertToAbsoluteUrls
		on by default.  Otherwise default to the convertToAbsoluteUrls option
		directly
	*/
	var autoFixUrls = options.convertToAbsoluteUrls === undefined && sourceMap;

	if (options.convertToAbsoluteUrls || autoFixUrls) {
		css = fixUrls(css);
	}

	if (sourceMap) {
		// http://stackoverflow.com/a/26603875
		css += "\n/*# sourceMappingURL=data:application/json;base64," + btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap)))) + " */";
	}

	var blob = new Blob([css], { type: "text/css" });

	var oldSrc = link.href;

	link.href = URL.createObjectURL(blob);

	if(oldSrc) URL.revokeObjectURL(oldSrc);
}


/***/ }),
/* 7 */
/***/ (function(module, exports) {


/**
 * When source maps are enabled, `style-loader` uses a link element with a data-uri to
 * embed the css on the page. This breaks all relative urls because now they are relative to a
 * bundle instead of the current page.
 *
 * One solution is to only use full urls, but that may be impossible.
 *
 * Instead, this function "fixes" the relative urls to be absolute according to the current page location.
 *
 * A rudimentary test suite is located at `test/fixUrls.js` and can be run via the `npm test` command.
 *
 */

module.exports = function (css) {
  // get current location
  var location = typeof window !== "undefined" && window.location;

  if (!location) {
    throw new Error("fixUrls requires window.location");
  }

	// blank or null?
	if (!css || typeof css !== "string") {
	  return css;
  }

  var baseUrl = location.protocol + "//" + location.host;
  var currentDir = baseUrl + location.pathname.replace(/\/[^\/]*$/, "/");

	// convert each url(...)
	/*
	This regular expression is just a way to recursively match brackets within
	a string.

	 /url\s*\(  = Match on the word "url" with any whitespace after it and then a parens
	   (  = Start a capturing group
	     (?:  = Start a non-capturing group
	         [^)(]  = Match anything that isn't a parentheses
	         |  = OR
	         \(  = Match a start parentheses
	             (?:  = Start another non-capturing groups
	                 [^)(]+  = Match anything that isn't a parentheses
	                 |  = OR
	                 \(  = Match a start parentheses
	                     [^)(]*  = Match anything that isn't a parentheses
	                 \)  = Match a end parentheses
	             )  = End Group
              *\) = Match anything and then a close parens
          )  = Close non-capturing group
          *  = Match anything
       )  = Close capturing group
	 \)  = Match a close parens

	 /gi  = Get all matches, not the first.  Be case insensitive.
	 */
	var fixedCss = css.replace(/url\s*\(((?:[^)(]|\((?:[^)(]+|\([^)(]*\))*\))*)\)/gi, function(fullMatch, origUrl) {
		// strip quotes (if they exist)
		var unquotedOrigUrl = origUrl
			.trim()
			.replace(/^"(.*)"$/, function(o, $1){ return $1; })
			.replace(/^'(.*)'$/, function(o, $1){ return $1; });

		// already a full url? no change
		if (/^(#|data:|http:\/\/|https:\/\/|file:\/\/\/)/i.test(unquotedOrigUrl)) {
		  return fullMatch;
		}

		// convert the url to a full url
		var newUrl;

		if (unquotedOrigUrl.indexOf("//") === 0) {
		  	//TODO: should we add protocol?
			newUrl = unquotedOrigUrl;
		} else if (unquotedOrigUrl.indexOf("/") === 0) {
			// path should be relative to the base url
			newUrl = baseUrl + unquotedOrigUrl; // already starts with '/'
		} else {
			// path should be relative to current directory
			newUrl = currentDir + unquotedOrigUrl.replace(/^\.\//, ""); // Strip leading './'
		}

		// send back the fixed url(...)
		return "url(" + JSON.stringify(newUrl) + ")";
	});

	// send back the fixed css
	return fixedCss;
};


/***/ }),
/* 8 */
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
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


/*Reference
https://bl.ocks.org/mbostock/3902569
*/

var dom = __webpack_require__(0);
var storedData = [];

var property = __webpack_require__(1);
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


/***/ }),
/* 10 */
/***/ (function(module, exports) {

/*
	MIT License http://www.opensource.org/licenses/mit-license.php
	Author Tobias Koppers @sokra
*/
// css base code, injected by the css-loader
module.exports = function(useSourceMap) {
	var list = [];

	// return the list of modules as css string
	list.toString = function toString() {
		return this.map(function (item) {
			var content = cssWithMappingToString(item, useSourceMap);
			if(item[2]) {
				return "@media " + item[2] + "{" + content + "}";
			} else {
				return content;
			}
		}).join("");
	};

	// import a list of modules into the list
	list.i = function(modules, mediaQuery) {
		if(typeof modules === "string")
			modules = [[null, modules, ""]];
		var alreadyImportedModules = {};
		for(var i = 0; i < this.length; i++) {
			var id = this[i][0];
			if(typeof id === "number")
				alreadyImportedModules[id] = true;
		}
		for(i = 0; i < modules.length; i++) {
			var item = modules[i];
			// skip already imported module
			// this implementation is not 100% perfect for weird media query combinations
			//  when a module is imported multiple times with different media queries.
			//  I hope this will never occur (Hey this way we have smaller bundles)
			if(typeof item[0] !== "number" || !alreadyImportedModules[item[0]]) {
				if(mediaQuery && !item[2]) {
					item[2] = mediaQuery;
				} else if(mediaQuery) {
					item[2] = "(" + item[2] + ") and (" + mediaQuery + ")";
				}
				list.push(item);
			}
		}
	};
	return list;
};

function cssWithMappingToString(item, useSourceMap) {
	var content = item[1] || '';
	var cssMapping = item[3];
	if (!cssMapping) {
		return content;
	}

	if (useSourceMap && typeof btoa === 'function') {
		var sourceMapping = toComment(cssMapping);
		var sourceURLs = cssMapping.sources.map(function (source) {
			return '/*# sourceURL=' + cssMapping.sourceRoot + source + ' */'
		});

		return [content].concat(sourceURLs).concat([sourceMapping]).join('\n');
	}

	return [content].join('\n');
}

// Adapted from convert-source-map (MIT)
function toComment(sourceMap) {
	// eslint-disable-next-line no-undef
	var base64 = btoa(unescape(encodeURIComponent(JSON.stringify(sourceMap))));
	var data = 'sourceMappingURL=data:application/json;charset=utf-8;base64,' + base64;

	return '/*# ' + data + ' */';
}


/***/ })
/******/ ]);