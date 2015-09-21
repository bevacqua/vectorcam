(function(f){if(typeof exports==="object"&&typeof module!=="undefined"){module.exports=f()}else if(typeof define==="function"&&define.amd){define([],f)}else{var g;if(typeof window!=="undefined"){g=window}else if(typeof global!=="undefined"){g=global}else if(typeof self!=="undefined"){g=self}else{g=this}g.vectorcam = f()}})(function(){var define,module,exports;return (function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';

function assignment (result) {
  var stack = Array.prototype.slice.call(arguments, 1);
  var item;
  var key;
  while (stack.length) {
    item = stack.shift();
    for (key in item) {
      if (item.hasOwnProperty(key)) {
        if (typeof result[key] === 'object' && result[key] && Object.prototype.toString.call(result[key]) !== '[object Array]') {
          if (typeof item[key] === 'object' && item[key] !== null) {
            result[key] = assignment(result[key], item[key]);
          } else {
            result[key] = item[key];
          }
        } else {
          result[key] = item[key];
        }
      }
    }
  }
  return result;
}

module.exports = assignment;

},{}],2:[function(require,module,exports){
// shim for using process in browser

var process = module.exports = {};
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = setTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    clearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        setTimeout(drainQueue, 0);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };

},{}],3:[function(require,module,exports){
// DEV: We don't use var but favor parameters since these play nicer with minification
function computedStyle(el, prop, getComputedStyle, style) {
  getComputedStyle = window.getComputedStyle;
  style =
      // If we have getComputedStyle
      getComputedStyle ?
        // Query it
        // TODO: From CSS-Query notes, we might need (node, null) for FF
        getComputedStyle(el) :

      // Otherwise, we are in IE and use currentStyle
        el.currentStyle;
  if (style) {
    return style
    [
      // Switch to camelCase for CSSOM
      // DEV: Grabbed from jQuery
      // https://github.com/jquery/jquery/blob/1.9-stable/src/css.js#L191-L194
      // https://github.com/jquery/jquery/blob/1.9-stable/src/core.js#L593-L597
      prop.replace(/-(\w)/gi, function (word, letter) {
        return letter.toUpperCase();
      })
    ];
  }
}

module.exports = computedStyle;

},{}],4:[function(require,module,exports){
/*Copyrights for code authored by Yahoo Inc. is licensed under the following terms:
MIT License
Copyright  2015 Yahoo Inc.
Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/
;(function(window, document, navigator, undefined) {
var utils, error, defaultOptions, isSupported, isWebCamGIFSupported, isExistingImagesGIFSupported, isExistingVideoGIFSupported, NeuQuant, processFrameWorker, gifWriter, AnimatedGIF, getBase64GIF, existingImages, screenShot, videoStream, stopVideoStreaming, createAndGetGIF, existingVideo, existingWebcam, createGIF, takeSnapShot, API;
utils = function () {
  var utils = {
    'URL': window.URL || window.webkitURL || window.mozURL || window.msURL,
    'getUserMedia': function () {
      var getUserMedia = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
      return getUserMedia ? getUserMedia.bind(navigator) : getUserMedia;
    }(),
    'requestAnimFrame': window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame,
    'requestTimeout': function (callback, delay) {
      callback = callback || utils.noop;
      delay = delay || 0;
      if (!utils.requestAnimFrame) {
        return setTimeout(callback, delay);
      }
      var start = new Date().getTime(), handle = new Object(), requestAnimFrame = utils.requestAnimFrame;
      function loop() {
        var current = new Date().getTime(), delta = current - start;
        delta >= delay ? callback.call() : handle.value = requestAnimFrame(loop);
      }
      handle.value = requestAnimFrame(loop);
      return handle;
    },
    'Blob': window.Blob || window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder || window.MSBlobBuilder,
    'btoa': function () {
      var btoa = window.btoa || function (input) {
        var output = '', i = 0, l = input.length, key = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=', chr1, chr2, chr3, enc1, enc2, enc3, enc4;
        while (i < l) {
          chr1 = input.charCodeAt(i++);
          chr2 = input.charCodeAt(i++);
          chr3 = input.charCodeAt(i++);
          enc1 = chr1 >> 2;
          enc2 = (chr1 & 3) << 4 | chr2 >> 4;
          enc3 = (chr2 & 15) << 2 | chr3 >> 6;
          enc4 = chr3 & 63;
          if (isNaN(chr2))
            enc3 = enc4 = 64;
          else if (isNaN(chr3))
            enc4 = 64;
          output = output + key.charAt(enc1) + key.charAt(enc2) + key.charAt(enc3) + key.charAt(enc4);
        }
        return output;
      };
      return btoa ? btoa.bind(window) : function () {
      };
    }(),
    'isObject': function (obj) {
      return obj && Object.prototype.toString.call(obj) === '[object Object]';
    },
    'isEmptyObject': function (obj) {
      return utils.isObject(obj) && !Object.keys(obj).length;
    },
    'isArray': function (arr) {
      return arr && Array.isArray(arr);
    },
    'isFunction': function (func) {
      return func && typeof func === 'function';
    },
    'isElement': function (elem) {
      return elem && elem.nodeType === 1;
    },
    'isString': function (value) {
      return typeof value === 'string' || Object.prototype.toString.call(value) === '[object String]';
    },
    'isSupported': {
      'canvas': function () {
        var el = document.createElement('canvas');
        return el && el.getContext && el.getContext('2d');
      },
      'webworkers': function () {
        return window.Worker;
      },
      'blob': function () {
        return utils.Blob;
      },
      'Uint8Array': function () {
        return window.Uint8Array;
      },
      'Uint32Array': function () {
        return window.Uint32Array;
      },
      'videoCodecs': function () {
        var testEl = document.createElement('video'), supportObj = {
            'mp4': false,
            'h264': false,
            'ogv': false,
            'ogg': false,
            'webm': false
          };
        try {
          if (testEl && testEl.canPlayType) {
            supportObj.mp4 = testEl.canPlayType('video/mp4; codecs="mp4v.20.8"') !== '';
            supportObj.h264 = (testEl.canPlayType('video/mp4; codecs="avc1.42E01E"') || testEl.canPlayType('video/mp4; codecs="avc1.42E01E, mp4a.40.2"')) !== '';
            supportObj.ogv = testEl.canPlayType('video/ogg; codecs="theora"') !== '';
            supportObj.ogg = testEl.canPlayType('video/ogg; codecs="theora"') !== '';
            supportObj.webm = testEl.canPlayType('video/webm; codecs="vp8, vorbis"') !== -1;
          }
        } catch (e) {
        }
        return supportObj;
      }()
    },
    'noop': function () {
    },
    'each': function (collection, callback) {
      var x, len;
      if (utils.isArray(collection)) {
        x = -1;
        len = collection.length;
        while (++x < len) {
          if (callback(x, collection[x]) === false) {
            break;
          }
        }
      } else if (utils.isObject(collection)) {
        for (x in collection) {
          if (collection.hasOwnProperty(x)) {
            if (callback(x, collection[x]) === false) {
              break;
            }
          }
        }
      }
    },
    'mergeOptions': function deepMerge(defaultOptions, userOptions) {
      if (!utils.isObject(defaultOptions) || !utils.isObject(userOptions) || !Object.keys) {
        return;
      }
      var newObj = {};
      utils.each(defaultOptions, function (key, val) {
        newObj[key] = defaultOptions[key];
      });
      utils.each(userOptions, function (key, val) {
        var currentUserOption = userOptions[key];
        if (!utils.isObject(currentUserOption)) {
          newObj[key] = currentUserOption;
        } else {
          if (!defaultOptions[key]) {
            newObj[key] = currentUserOption;
          } else {
            newObj[key] = deepMerge(defaultOptions[key], currentUserOption);
          }
        }
      });
      return newObj;
    },
    'setCSSAttr': function (elem, attr, val) {
      if (!utils.isElement(elem)) {
        return;
      }
      if (utils.isString(attr) && utils.isString(val)) {
        elem.style[attr] = val;
      } else if (utils.isObject(attr)) {
        utils.each(attr, function (key, val) {
          elem.style[key] = val;
        });
      }
    },
    'removeElement': function (node) {
      if (!utils.isElement(node)) {
        return;
      }
      if (node.parentNode) {
        node.parentNode.removeChild(node);
      }
    },
    'createWebWorker': function (content) {
      if (!utils.isString(content)) {
        return {};
      }
      try {
        var blob = new utils.Blob([content], { 'type': 'text/javascript' }), objectUrl = utils.URL.createObjectURL(blob), worker = new Worker(objectUrl);
        return {
          'objectUrl': objectUrl,
          'worker': worker
        };
      } catch (e) {
        return '' + e;
      }
    },
    'getExtension': function (src) {
      return src.substr(src.lastIndexOf('.') + 1, src.length);
    },
    'getFontSize': function (options) {
      options = options || {};
      if (!document.body || options.resizeFont === false) {
        return options.fontSize;
      }
      var text = options.text, containerWidth = options.gifWidth, fontSize = parseInt(options.fontSize, 10), minFontSize = parseInt(options.minFontSize, 10), div = document.createElement('div'), span = document.createElement('span');
      div.setAttribute('width', containerWidth);
      div.appendChild(span);
      span.innerHTML = text;
      span.style.fontSize = fontSize + 'px';
      span.style.textIndent = '-9999px';
      span.style.visibility = 'hidden';
      document.body.appendChild(span);
      while (span.offsetWidth > containerWidth && fontSize >= minFontSize) {
        span.style.fontSize = --fontSize + 'px';
      }
      document.body.removeChild(span);
      return fontSize + 'px';
    },
    'webWorkerError': false
  };
  return utils;
}();
error = function (utils) {
  var error = {
    'validate': function (skipObj) {
      skipObj = utils.isObject(skipObj) ? skipObj : {};
      var errorObj = {};
      utils.each(error.validators, function (indece, currentValidator) {
        var errorCode = currentValidator.errorCode;
        if (!skipObj[errorCode] && !currentValidator.condition) {
          errorObj = currentValidator;
          errorObj.error = true;
          return false;
        }
      });
      delete errorObj.condition;
      return errorObj;
    },
    'isValid': function (skipObj) {
      var errorObj = error.validate(skipObj), isValid = errorObj.error !== true ? true : false;
      return isValid;
    },
    'validators': [
      {
        'condition': utils.isFunction(utils.getUserMedia),
        'errorCode': 'getUserMedia',
        'errorMsg': 'The getUserMedia API is not supported in your browser'
      },
      {
        'condition': utils.isSupported.canvas(),
        'errorCode': 'canvas',
        'errorMsg': 'Canvas elements are not supported in your browser'
      },
      {
        'condition': utils.isSupported.webworkers(),
        'errorCode': 'webworkers',
        'errorMsg': 'The Web Workers API is not supported in your browser'
      },
      {
        'condition': utils.isFunction(utils.URL),
        'errorCode': 'window.URL',
        'errorMsg': 'The window.URL API is not supported in your browser'
      },
      {
        'condition': utils.isSupported.blob(),
        'errorCode': 'window.Blob',
        'errorMsg': 'The window.Blob File API is not supported in your browser'
      },
      {
        'condition': utils.isSupported.Uint8Array(),
        'errorCode': 'window.Uint8Array',
        'errorMsg': 'The window.Uint8Array function constructor is not supported in your browser'
      },
      {
        'condition': utils.isSupported.Uint32Array(),
        'errorCode': 'window.Uint32Array',
        'errorMsg': 'The window.Uint32Array function constructor is not supported in your browser'
      }
    ],
    'messages': {
      'videoCodecs': {
        'errorCode': 'videocodec',
        'errorMsg': 'The video codec you are trying to use is not supported in your browser'
      }
    }
  };
  return error;
}(utils);
defaultOptions = {
  'sampleInterval': 10,
  'numWorkers': 2,
  'gifWidth': 200,
  'gifHeight': 200,
  'interval': 0.1,
  'numFrames': 10,
  'keepCameraOn': false,
  'images': [],
  'video': null,
  'webcamVideoElement': null,
  'cameraStream': null,
  'text': '',
  'fontWeight': 'normal',
  'fontSize': '16px',
  'minFontSize': '10px',
  'resizeFont': false,
  'fontFamily': 'sans-serif',
  'fontColor': '#ffffff',
  'textAlign': 'center',
  'textBaseline': 'bottom',
  'textXCoordinate': null,
  'textYCoordinate': null,
  'progressCallback': function (captureProgress) {
  },
  'completeCallback': function () {
  },
  'saveRenderingContexts': false,
  'savedRenderingContexts': [],
  'crossOrigin': 'Anonymous'
};
isSupported = function () {
  return error.isValid();
};
isWebCamGIFSupported = function () {
  return error.isValid();
};
isExistingImagesGIFSupported = function () {
  var skipObj = { 'getUserMedia': true };
  return error.isValid(skipObj);
};
isExistingVideoGIFSupported = function (codecs) {
  var isSupported = false, hasValidCodec = false;
  if (utils.isArray(codecs) && codecs.length) {
    utils.each(codecs, function (indece, currentCodec) {
      if (utils.isSupported.videoCodecs[currentCodec]) {
        hasValidCodec = true;
      }
    });
    if (!hasValidCodec) {
      return false;
    }
  } else if (utils.isString(codecs) && codecs.length) {
    if (!utils.isSupported.videoCodecs[codecs]) {
      return false;
    }
  }
  return error.isValid({ 'getUserMedia': true });
};
NeuQuant = function () {
  function NeuQuant() {
    var netsize = 256;
    var prime1 = 499;
    var prime2 = 491;
    var prime3 = 487;
    var prime4 = 503;
    var minpicturebytes = 3 * prime4;
    var maxnetpos = netsize - 1;
    var netbiasshift = 4;
    var ncycles = 100;
    var intbiasshift = 16;
    var intbias = 1 << intbiasshift;
    var gammashift = 10;
    var gamma = 1 << gammashift;
    var betashift = 10;
    var beta = intbias >> betashift;
    var betagamma = intbias << gammashift - betashift;
    var initrad = netsize >> 3;
    var radiusbiasshift = 6;
    var radiusbias = 1 << radiusbiasshift;
    var initradius = initrad * radiusbias;
    var radiusdec = 30;
    var alphabiasshift = 10;
    var initalpha = 1 << alphabiasshift;
    var alphadec;
    var radbiasshift = 8;
    var radbias = 1 << radbiasshift;
    var alpharadbshift = alphabiasshift + radbiasshift;
    var alpharadbias = 1 << alpharadbshift;
    var thepicture;
    var lengthcount;
    var samplefac;
    var network;
    var netindex = [];
    var bias = [];
    var freq = [];
    var radpower = [];
    function NeuQuantConstructor(thepic, len, sample) {
      var i;
      var p;
      thepicture = thepic;
      lengthcount = len;
      samplefac = sample;
      network = new Array(netsize);
      for (i = 0; i < netsize; i++) {
        network[i] = new Array(4);
        p = network[i];
        p[0] = p[1] = p[2] = (i << netbiasshift + 8) / netsize | 0;
        freq[i] = intbias / netsize | 0;
        bias[i] = 0;
      }
    }
    function colorMap() {
      var map = [];
      var index = new Array(netsize);
      for (var i = 0; i < netsize; i++)
        index[network[i][3]] = i;
      var k = 0;
      for (var l = 0; l < netsize; l++) {
        var j = index[l];
        map[k++] = network[j][0];
        map[k++] = network[j][1];
        map[k++] = network[j][2];
      }
      return map;
    }
    function inxbuild() {
      var i;
      var j;
      var smallpos;
      var smallval;
      var p;
      var q;
      var previouscol;
      var startpos;
      previouscol = 0;
      startpos = 0;
      for (i = 0; i < netsize; i++) {
        p = network[i];
        smallpos = i;
        smallval = p[1];
        for (j = i + 1; j < netsize; j++) {
          q = network[j];
          if (q[1] < smallval) {
            smallpos = j;
            smallval = q[1];
          }
        }
        q = network[smallpos];
        if (i != smallpos) {
          j = q[0];
          q[0] = p[0];
          p[0] = j;
          j = q[1];
          q[1] = p[1];
          p[1] = j;
          j = q[2];
          q[2] = p[2];
          p[2] = j;
          j = q[3];
          q[3] = p[3];
          p[3] = j;
        }
        if (smallval != previouscol) {
          netindex[previouscol] = startpos + i >> 1;
          for (j = previouscol + 1; j < smallval; j++) {
            netindex[j] = i;
          }
          previouscol = smallval;
          startpos = i;
        }
      }
      netindex[previouscol] = startpos + maxnetpos >> 1;
      for (j = previouscol + 1; j < 256; j++) {
        netindex[j] = maxnetpos;
      }
    }
    function learn() {
      var i;
      var j;
      var b;
      var g;
      var r;
      var radius;
      var rad;
      var alpha;
      var step;
      var delta;
      var samplepixels;
      var p;
      var pix;
      var lim;
      if (lengthcount < minpicturebytes) {
        samplefac = 1;
      }
      alphadec = 30 + (samplefac - 1) / 3;
      p = thepicture;
      pix = 0;
      lim = lengthcount;
      samplepixels = lengthcount / (3 * samplefac);
      delta = samplepixels / ncycles | 0;
      alpha = initalpha;
      radius = initradius;
      rad = radius >> radiusbiasshift;
      if (rad <= 1) {
        rad = 0;
      }
      for (i = 0; i < rad; i++) {
        radpower[i] = alpha * ((rad * rad - i * i) * radbias / (rad * rad));
      }
      if (lengthcount < minpicturebytes) {
        step = 3;
      } else if (lengthcount % prime1 !== 0) {
        step = 3 * prime1;
      } else {
        if (lengthcount % prime2 !== 0) {
          step = 3 * prime2;
        } else {
          if (lengthcount % prime3 !== 0) {
            step = 3 * prime3;
          } else {
            step = 3 * prime4;
          }
        }
      }
      i = 0;
      while (i < samplepixels) {
        b = (p[pix + 0] & 255) << netbiasshift;
        g = (p[pix + 1] & 255) << netbiasshift;
        r = (p[pix + 2] & 255) << netbiasshift;
        j = contest(b, g, r);
        altersingle(alpha, j, b, g, r);
        if (rad !== 0) {
          alterneigh(rad, j, b, g, r);
        }
        pix += step;
        if (pix >= lim) {
          pix -= lengthcount;
        }
        i++;
        if (delta === 0) {
          delta = 1;
        }
        if (i % delta === 0) {
          alpha -= alpha / alphadec;
          radius -= radius / radiusdec;
          rad = radius >> radiusbiasshift;
          if (rad <= 1) {
            rad = 0;
          }
          for (j = 0; j < rad; j++) {
            radpower[j] = alpha * ((rad * rad - j * j) * radbias / (rad * rad));
          }
        }
      }
    }
    function map(b, g, r) {
      var i;
      var j;
      var dist;
      var a;
      var bestd;
      var p;
      var best;
      bestd = 1000;
      best = -1;
      i = netindex[g];
      j = i - 1;
      while (i < netsize || j >= 0) {
        if (i < netsize) {
          p = network[i];
          dist = p[1] - g;
          if (dist >= bestd) {
            i = netsize;
          } else {
            i++;
            if (dist < 0) {
              dist = -dist;
            }
            a = p[0] - b;
            if (a < 0) {
              a = -a;
            }
            dist += a;
            if (dist < bestd) {
              a = p[2] - r;
              if (a < 0) {
                a = -a;
              }
              dist += a;
              if (dist < bestd) {
                bestd = dist;
                best = p[3];
              }
            }
          }
        }
        if (j >= 0) {
          p = network[j];
          dist = g - p[1];
          if (dist >= bestd) {
            j = -1;
          } else {
            j--;
            if (dist < 0) {
              dist = -dist;
            }
            a = p[0] - b;
            if (a < 0) {
              a = -a;
            }
            dist += a;
            if (dist < bestd) {
              a = p[2] - r;
              if (a < 0) {
                a = -a;
              }
              dist += a;
              if (dist < bestd) {
                bestd = dist;
                best = p[3];
              }
            }
          }
        }
      }
      return best;
    }
    function process() {
      learn();
      unbiasnet();
      inxbuild();
      return colorMap();
    }
    function unbiasnet() {
      var i;
      var j;
      for (i = 0; i < netsize; i++) {
        network[i][0] >>= netbiasshift;
        network[i][1] >>= netbiasshift;
        network[i][2] >>= netbiasshift;
        network[i][3] = i;
      }
    }
    function alterneigh(rad, i, b, g, r) {
      var j;
      var k;
      var lo;
      var hi;
      var a;
      var m;
      var p;
      lo = i - rad;
      if (lo < -1) {
        lo = -1;
      }
      hi = i + rad;
      if (hi > netsize) {
        hi = netsize;
      }
      j = i + 1;
      k = i - 1;
      m = 1;
      while (j < hi || k > lo) {
        a = radpower[m++];
        if (j < hi) {
          p = network[j++];
          try {
            p[0] -= a * (p[0] - b) / alpharadbias | 0;
            p[1] -= a * (p[1] - g) / alpharadbias | 0;
            p[2] -= a * (p[2] - r) / alpharadbias | 0;
          } catch (e) {
          }
        }
        if (k > lo) {
          p = network[k--];
          try {
            p[0] -= a * (p[0] - b) / alpharadbias | 0;
            p[1] -= a * (p[1] - g) / alpharadbias | 0;
            p[2] -= a * (p[2] - r) / alpharadbias | 0;
          } catch (e) {
          }
        }
      }
    }
    function altersingle(alpha, i, b, g, r) {
      var n = network[i];
      var alphaMult = alpha / initalpha;
      n[0] -= alphaMult * (n[0] - b) | 0;
      n[1] -= alphaMult * (n[1] - g) | 0;
      n[2] -= alphaMult * (n[2] - r) | 0;
    }
    function contest(b, g, r) {
      var i;
      var dist;
      var a;
      var biasdist;
      var betafreq;
      var bestpos;
      var bestbiaspos;
      var bestd;
      var bestbiasd;
      var n;
      bestd = ~(1 << 31);
      bestbiasd = bestd;
      bestpos = -1;
      bestbiaspos = bestpos;
      for (i = 0; i < netsize; i++) {
        n = network[i];
        dist = n[0] - b;
        if (dist < 0) {
          dist = -dist;
        }
        a = n[1] - g;
        if (a < 0) {
          a = -a;
        }
        dist += a;
        a = n[2] - r;
        if (a < 0) {
          a = -a;
        }
        dist += a;
        if (dist < bestd) {
          bestd = dist;
          bestpos = i;
        }
        biasdist = dist - (bias[i] >> intbiasshift - netbiasshift);
        if (biasdist < bestbiasd) {
          bestbiasd = biasdist;
          bestbiaspos = i;
        }
        betafreq = freq[i] >> betashift;
        freq[i] -= betafreq;
        bias[i] += betafreq << gammashift;
      }
      freq[bestpos] += beta;
      bias[bestpos] -= betagamma;
      return bestbiaspos;
    }
    NeuQuantConstructor.apply(this, arguments);
    var exports = {};
    exports.map = map;
    exports.process = process;
    return exports;
  }
  return NeuQuant;
}();
processFrameWorker = function (NeuQuant) {
  var workerCode = function () {
    try {
      self.onmessage = function (ev) {
        var data = ev.data || {};
        var response;
        if (data.gifshot) {
          response = workerMethods.run(data);
          postMessage(response);
        }
      };
    } catch (e) {
    }
    var workerMethods = {
      'dataToRGB': function (data, width, height) {
        var i = 0, length = width * height * 4, rgb = [];
        while (i < length) {
          rgb.push(data[i++]);
          rgb.push(data[i++]);
          rgb.push(data[i++]);
          i++;
        }
        return rgb;
      },
      'componentizedPaletteToArray': function (paletteRGB) {
        var paletteArray = [], i, r, g, b;
        for (i = 0; i < paletteRGB.length; i += 3) {
          r = paletteRGB[i];
          g = paletteRGB[i + 1];
          b = paletteRGB[i + 2];
          paletteArray.push(r << 16 | g << 8 | b);
        }
        return paletteArray;
      },
      'processFrameWithQuantizer': function (imageData, width, height, sampleInterval) {
        var rgbComponents = this.dataToRGB(imageData, width, height), nq = new NeuQuant(rgbComponents, rgbComponents.length, sampleInterval), paletteRGB = nq.process(), paletteArray = new Uint32Array(this.componentizedPaletteToArray(paletteRGB)), numberPixels = width * height, indexedPixels = new Uint8Array(numberPixels), k = 0, i, r, g, b;
        for (i = 0; i < numberPixels; i++) {
          r = rgbComponents[k++];
          g = rgbComponents[k++];
          b = rgbComponents[k++];
          indexedPixels[i] = nq.map(r, g, b);
        }
        return {
          pixels: indexedPixels,
          palette: paletteArray
        };
      },
      'run': function (frame) {
        var width = frame.width, height = frame.height, imageData = frame.data, palette = frame.palette, sampleInterval = frame.sampleInterval;
        return this.processFrameWithQuantizer(imageData, width, height, sampleInterval);
      }
    };
    return workerMethods;
  };
  return workerCode;
}(NeuQuant);
gifWriter = function gifWriter(buf, width, height, gopts) {
  var p = 0;
  gopts = gopts === undefined ? {} : gopts;
  var loop_count = gopts.loop === undefined ? null : gopts.loop;
  var global_palette = gopts.palette === undefined ? null : gopts.palette;
  if (width <= 0 || height <= 0 || width > 65535 || height > 65535)
    throw 'Width/Height invalid.';
  function check_palette_and_num_colors(palette) {
    var num_colors = palette.length;
    if (num_colors < 2 || num_colors > 256 || num_colors & num_colors - 1)
      throw 'Invalid code/color length, must be power of 2 and 2 .. 256.';
    return num_colors;
  }
  buf[p++] = 71;
  buf[p++] = 73;
  buf[p++] = 70;
  buf[p++] = 56;
  buf[p++] = 57;
  buf[p++] = 97;
  var gp_num_colors_pow2 = 0;
  var background = 0;
  buf[p++] = width & 255;
  buf[p++] = width >> 8 & 255;
  buf[p++] = height & 255;
  buf[p++] = height >> 8 & 255;
  buf[p++] = (global_palette !== null ? 128 : 0) | gp_num_colors_pow2;
  buf[p++] = background;
  buf[p++] = 0;
  if (loop_count !== null) {
    if (loop_count < 0 || loop_count > 65535)
      throw 'Loop count invalid.';
    buf[p++] = 33;
    buf[p++] = 255;
    buf[p++] = 11;
    buf[p++] = 78;
    buf[p++] = 69;
    buf[p++] = 84;
    buf[p++] = 83;
    buf[p++] = 67;
    buf[p++] = 65;
    buf[p++] = 80;
    buf[p++] = 69;
    buf[p++] = 50;
    buf[p++] = 46;
    buf[p++] = 48;
    buf[p++] = 3;
    buf[p++] = 1;
    buf[p++] = loop_count & 255;
    buf[p++] = loop_count >> 8 & 255;
    buf[p++] = 0;
  }
  var ended = false;
  this.addFrame = function (x, y, w, h, indexed_pixels, opts) {
    if (ended === true) {
      --p;
      ended = false;
    }
    opts = opts === undefined ? {} : opts;
    if (x < 0 || y < 0 || x > 65535 || y > 65535)
      throw 'x/y invalid.';
    if (w <= 0 || h <= 0 || w > 65535 || h > 65535)
      throw 'Width/Height invalid.';
    if (indexed_pixels.length < w * h)
      throw 'Not enough pixels for the frame size.';
    var using_local_palette = true;
    var palette = opts.palette;
    if (palette === undefined || palette === null) {
      using_local_palette = false;
      palette = global_palette;
    }
    if (palette === undefined || palette === null)
      throw 'Must supply either a local or global palette.';
    var num_colors = check_palette_and_num_colors(palette);
    var min_code_size = 0;
    while (num_colors >>= 1)
      ++min_code_size;
    num_colors = 1 << min_code_size;
    var delay = opts.delay === undefined ? 0 : opts.delay;
    var disposal = opts.disposal === undefined ? 0 : opts.disposal;
    if (disposal < 0 || disposal > 3)
      throw 'Disposal out of range.';
    var use_transparency = false;
    var transparent_index = 0;
    if (opts.transparent !== undefined && opts.transparent !== null) {
      use_transparency = true;
      transparent_index = opts.transparent;
      if (transparent_index < 0 || transparent_index >= num_colors)
        throw 'Transparent color index.';
    }
    if (disposal !== 0 || use_transparency || delay !== 0) {
      buf[p++] = 33;
      buf[p++] = 249;
      buf[p++] = 4;
      buf[p++] = disposal << 2 | (use_transparency === true ? 1 : 0);
      buf[p++] = delay & 255;
      buf[p++] = delay >> 8 & 255;
      buf[p++] = transparent_index;
      buf[p++] = 0;
    }
    buf[p++] = 44;
    buf[p++] = x & 255;
    buf[p++] = x >> 8 & 255;
    buf[p++] = y & 255;
    buf[p++] = y >> 8 & 255;
    buf[p++] = w & 255;
    buf[p++] = w >> 8 & 255;
    buf[p++] = h & 255;
    buf[p++] = h >> 8 & 255;
    buf[p++] = using_local_palette === true ? 128 | min_code_size - 1 : 0;
    if (using_local_palette === true) {
      for (var i = 0, il = palette.length; i < il; ++i) {
        var rgb = palette[i];
        buf[p++] = rgb >> 16 & 255;
        buf[p++] = rgb >> 8 & 255;
        buf[p++] = rgb & 255;
      }
    }
    p = GifWriterOutputLZWCodeStream(buf, p, min_code_size < 2 ? 2 : min_code_size, indexed_pixels);
  };
  this.end = function () {
    if (ended === false) {
      buf[p++] = 59;
      ended = true;
    }
    return p;
  };
  function GifWriterOutputLZWCodeStream(buf, p, min_code_size, index_stream) {
    buf[p++] = min_code_size;
    var cur_subblock = p++;
    var clear_code = 1 << min_code_size;
    var code_mask = clear_code - 1;
    var eoi_code = clear_code + 1;
    var next_code = eoi_code + 1;
    var cur_code_size = min_code_size + 1;
    var cur_shift = 0;
    var cur = 0;
    function emit_bytes_to_buffer(bit_block_size) {
      while (cur_shift >= bit_block_size) {
        buf[p++] = cur & 255;
        cur >>= 8;
        cur_shift -= 8;
        if (p === cur_subblock + 256) {
          buf[cur_subblock] = 255;
          cur_subblock = p++;
        }
      }
    }
    function emit_code(c) {
      cur |= c << cur_shift;
      cur_shift += cur_code_size;
      emit_bytes_to_buffer(8);
    }
    var ib_code = index_stream[0] & code_mask;
    var code_table = {};
    emit_code(clear_code);
    for (var i = 1, il = index_stream.length; i < il; ++i) {
      var k = index_stream[i] & code_mask;
      var cur_key = ib_code << 8 | k;
      var cur_code = code_table[cur_key];
      if (cur_code === undefined) {
        cur |= ib_code << cur_shift;
        cur_shift += cur_code_size;
        while (cur_shift >= 8) {
          buf[p++] = cur & 255;
          cur >>= 8;
          cur_shift -= 8;
          if (p === cur_subblock + 256) {
            buf[cur_subblock] = 255;
            cur_subblock = p++;
          }
        }
        if (next_code === 4096) {
          emit_code(clear_code);
          next_code = eoi_code + 1;
          cur_code_size = min_code_size + 1;
          code_table = {};
        } else {
          if (next_code >= 1 << cur_code_size)
            ++cur_code_size;
          code_table[cur_key] = next_code++;
        }
        ib_code = k;
      } else {
        ib_code = cur_code;
      }
    }
    emit_code(ib_code);
    emit_code(eoi_code);
    emit_bytes_to_buffer(1);
    if (cur_subblock + 1 === p) {
      buf[cur_subblock] = 0;
    } else {
      buf[cur_subblock] = p - cur_subblock - 1;
      buf[p++] = 0;
    }
    return p;
  }
};
AnimatedGIF = function (utils, frameWorkerCode, NeuQuant, GifWriter) {
  var AnimatedGIF = function (options) {
    this.canvas = null;
    this.ctx = null;
    this.repeat = 0;
    this.frames = [];
    this.numRenderedFrames = 0;
    this.onRenderCompleteCallback = utils.noop;
    this.onRenderProgressCallback = utils.noop;
    this.workers = [];
    this.availableWorkers = [];
    this.generatingGIF = false;
    this.options = options;
    this.initializeWebWorkers(options);
  };
  AnimatedGIF.prototype = {
    'workerMethods': frameWorkerCode(),
    'initializeWebWorkers': function (options) {
      var processFrameWorkerCode = NeuQuant.toString() + '(' + frameWorkerCode.toString() + '());', webWorkerObj, objectUrl, webWorker, numWorkers, x = -1, workerError = '';
      numWorkers = options.numWorkers;
      while (++x < numWorkers) {
        webWorkerObj = utils.createWebWorker(processFrameWorkerCode);
        if (utils.isObject(webWorkerObj)) {
          objectUrl = webWorkerObj.objectUrl;
          webWorker = webWorkerObj.worker;
          this.workers.push({
            'worker': webWorker,
            'objectUrl': objectUrl
          });
          this.availableWorkers.push(webWorker);
        } else {
          workerError = webWorkerObj;
          utils.webWorkerError = !!webWorkerObj;
        }
      }
      this.workerError = workerError;
      this.canvas = document.createElement('canvas');
      this.canvas.width = options.gifWidth;
      this.canvas.height = options.gifHeight;
      this.ctx = this.canvas.getContext('2d');
      this.frames = [];
    },
    'getWorker': function () {
      return this.availableWorkers.pop();
    },
    'freeWorker': function (worker) {
      this.availableWorkers.push(worker);
    },
    'byteMap': function () {
      var byteMap = [];
      for (var i = 0; i < 256; i++) {
        byteMap[i] = String.fromCharCode(i);
      }
      return byteMap;
    }(),
    'bufferToString': function (buffer) {
      var numberValues = buffer.length, str = '', x = -1;
      while (++x < numberValues) {
        str += this.byteMap[buffer[x]];
      }
      return str;
    },
    'onFrameFinished': function (progressCallback) {
      var self = this, frames = self.frames, options = self.options;
      hasExistingImages = !!(options.images || []).length;
      allDone = frames.every(function (frame) {
        return !frame.beingProcessed && frame.done;
      });
      self.numRenderedFrames++;
      if (hasExistingImages) {
        progressCallback(self.numRenderedFrames / frames.length);
      }
      self.onRenderProgressCallback(self.numRenderedFrames * 0.75 / frames.length);
      if (allDone) {
        if (!self.generatingGIF) {
          self.generateGIF(frames, self.onRenderCompleteCallback);
        }
      } else {
        utils.requestTimeout(function () {
          self.processNextFrame();
        }, 1);
      }
    },
    'processFrame': function (position) {
      var AnimatedGifContext = this, options = this.options, progressCallback = options.progressCallback, sampleInterval = options.sampleInterval, frames = this.frames, frame, worker, done = function (ev) {
          var data = ev.data;
          delete frame.data;
          frame.pixels = Array.prototype.slice.call(data.pixels);
          frame.palette = Array.prototype.slice.call(data.palette);
          frame.done = true;
          frame.beingProcessed = false;
          AnimatedGifContext.freeWorker(worker);
          AnimatedGifContext.onFrameFinished(progressCallback);
        };
      frame = frames[position];
      if (frame.beingProcessed || frame.done) {
        this.onFrameFinished();
        return;
      }
      frame.sampleInterval = sampleInterval;
      frame.beingProcessed = true;
      frame.gifshot = true;
      worker = this.getWorker();
      if (worker) {
        worker.onmessage = done;
        worker.postMessage(frame);
      } else {
        done({ 'data': AnimatedGifContext.workerMethods.run(frame) });
      }
    },
    'startRendering': function (completeCallback) {
      this.onRenderCompleteCallback = completeCallback;
      for (var i = 0; i < this.options.numWorkers && i < this.frames.length; i++) {
        this.processFrame(i);
      }
    },
    'processNextFrame': function () {
      var position = -1;
      for (var i = 0; i < this.frames.length; i++) {
        var frame = this.frames[i];
        if (!frame.done && !frame.beingProcessed) {
          position = i;
          break;
        }
      }
      if (position >= 0) {
        this.processFrame(position);
      }
    },
    'generateGIF': function (frames, callback) {
      var buffer = [], gifOptions = { 'loop': this.repeat }, options = this.options, interval = options.interval, existingImages = options.images, hasExistingImages = !!existingImages.length, height = options.gifHeight, width = options.gifWidth, gifWriter = new GifWriter(buffer, width, height, gifOptions), onRenderProgressCallback = this.onRenderProgressCallback, delay = hasExistingImages ? interval * 100 : 0, bufferToString, gif;
      this.generatingGIF = true;
      utils.each(frames, function (iterator, frame) {
        var framePalette = frame.palette;
        onRenderProgressCallback(0.75 + 0.25 * frame.position * 1 / frames.length);
        gifWriter.addFrame(0, 0, width, height, frame.pixels, {
          palette: framePalette,
          delay: delay
        });
      });
      gifWriter.end();
      onRenderProgressCallback(1);
      this.frames = [];
      this.generatingGIF = false;
      if (utils.isFunction(callback)) {
        bufferToString = this.bufferToString(buffer);
        gif = 'data:image/gif;base64,' + utils.btoa(bufferToString);
        callback(gif);
      }
    },
    'setRepeat': function (r) {
      this.repeat = r;
    },
    'addFrame': function (element, gifshotOptions) {
      gifshotOptions = utils.isObject(gifshotOptions) ? gifshotOptions : {};
      var self = this, ctx = self.ctx, options = self.options, width = options.gifWidth, height = options.gifHeight, gifHeight = gifshotOptions.gifHeight, gifWidth = gifshotOptions.gifWidth, text = gifshotOptions.text, fontWeight = gifshotOptions.fontWeight, fontSize = utils.getFontSize(gifshotOptions), fontFamily = gifshotOptions.fontFamily, fontColor = gifshotOptions.fontColor, textAlign = gifshotOptions.textAlign, textBaseline = gifshotOptions.textBaseline, textXCoordinate = gifshotOptions.textXCoordinate ? gifshotOptions.textXCoordinate : textAlign === 'left' ? 1 : textAlign === 'right' ? width : width / 2, textYCoordinate = gifshotOptions.textYCoordinate ? gifshotOptions.textYCoordinate : textBaseline === 'top' ? 1 : textBaseline === 'center' ? height / 2 : height, font = fontWeight + ' ' + fontSize + ' ' + fontFamily, imageData;
      try {
        ctx.drawImage(element, 0, 0, width, height);
        if (text) {
          ctx.font = font;
          ctx.fillStyle = fontColor;
          ctx.textAlign = textAlign;
          ctx.textBaseline = textBaseline;
          ctx.fillText(text, textXCoordinate, textYCoordinate);
        }
        imageData = ctx.getImageData(0, 0, width, height);
        self.addFrameImageData(imageData);
      } catch (e) {
        return '' + e;
      }
    },
    'addFrameImageData': function (imageData) {
      var frames = this.frames, imageDataArray = imageData.data;
      this.frames.push({
        'data': imageDataArray,
        'width': imageData.width,
        'height': imageData.height,
        'palette': null,
        'dithering': null,
        'done': false,
        'beingProcessed': false,
        'position': frames.length
      });
    },
    'onRenderProgress': function (callback) {
      this.onRenderProgressCallback = callback;
    },
    'isRendering': function () {
      return this.generatingGIF;
    },
    'getBase64GIF': function (completeCallback) {
      var self = this, onRenderComplete = function (gif) {
          self.destroyWorkers();
          utils.requestTimeout(function () {
            completeCallback(gif);
          }, 0);
        };
      self.startRendering(onRenderComplete);
    },
    'destroyWorkers': function () {
      if (this.workerError) {
        return;
      }
      var workers = this.workers;
      utils.each(workers, function (iterator, workerObj) {
        var worker = workerObj.worker, objectUrl = workerObj.objectUrl;
        worker.terminate();
        utils.URL.revokeObjectURL(objectUrl);
      });
    }
  };
  return AnimatedGIF;
}(utils, processFrameWorker, NeuQuant, gifWriter);
getBase64GIF = function getBase64GIF(animatedGifInstance, callback) {
  animatedGifInstance.getBase64GIF(function (image) {
    callback({
      'error': false,
      'errorCode': '',
      'errorMsg': '',
      'image': image
    });
  });
};
existingImages = function (obj) {
  var images = obj.images, imagesLength = obj.imagesLength, callback = obj.callback, options = obj.options, skipObj = {
      'getUserMedia': true,
      'window.URL': true
    }, errorObj = error.validate(skipObj), loadedImages = [], loadedImagesLength = 0, tempImage, ag;
  if (errorObj.error) {
    return callback(errorObj);
  }
  ag = new AnimatedGIF(options);
  utils.each(images, function (index, currentImage) {
    if (utils.isElement(currentImage)) {
      if (options.crossOrigin) {
        currentImage.crossOrigin = options.crossOrigin;
      }
      loadedImages[index] = currentImage;
      loadedImagesLength += 1;
      if (loadedImagesLength === imagesLength) {
        addLoadedImagesToGif();
      }
    } else if (utils.isString(currentImage)) {
      tempImage = document.createElement('img');
      if (options.crossOrigin) {
        tempImage.crossOrigin = options.crossOrigin;
      }
      tempImage.onerror = function (e) {
        if (loadedImages.length > index) {
          loadedImages[index] = undefined;
        }
      }(function (tempImage) {
        tempImage.onload = function () {
          loadedImages[index] = tempImage;
          loadedImagesLength += 1;
          if (loadedImagesLength === imagesLength) {
            addLoadedImagesToGif();
          }
          utils.removeElement(tempImage);
        };
      }(tempImage));
      tempImage.src = currentImage;
      utils.setCSSAttr(tempImage, {
        'position': 'fixed',
        'opacity': '0'
      });
      document.body.appendChild(tempImage);
    }
  });
  function addLoadedImagesToGif() {
    utils.each(loadedImages, function (index, loadedImage) {
      if (loadedImage) {
        ag.addFrame(loadedImage, options);
      }
    });
    getBase64GIF(ag, callback);
  }
};
screenShot = {
  getGIF: function (options, callback) {
    callback = utils.isFunction(callback) ? callback : utils.noop;
    var canvas = document.createElement('canvas'), context, existingImages = options.images, hasExistingImages = !!existingImages.length, videoElement = options.videoElement, keepCameraOn = options.keepCameraOn, webcamVideoElement = options.webcamVideoElement, cameraStream = options.cameraStream, gifWidth = +options.gifWidth, gifHeight = +options.gifHeight, videoWidth = options.videoWidth, videoHeight = options.videoHeight, sampleInterval = +options.sampleInterval, numWorkers = +options.numWorkers, crop = options.crop, interval = +options.interval, waitBetweenFrames = hasExistingImages ? 0 : interval * 1000, progressCallback = options.progressCallback, savedRenderingContexts = options.savedRenderingContexts, saveRenderingContexts = options.saveRenderingContexts, renderingContextsToSave = [], numFrames = savedRenderingContexts.length ? savedRenderingContexts.length : options.numFrames, pendingFrames = numFrames, ag = new AnimatedGIF(options), text = options.text, fontWeight = options.fontWeight, fontSize = utils.getFontSize(options), fontFamily = options.fontFamily, fontColor = options.fontColor, textAlign = options.textAlign, textBaseline = options.textBaseline, textXCoordinate = options.textXCoordinate ? options.textXCoordinate : textAlign === 'left' ? 1 : textAlign === 'right' ? gifWidth : gifWidth / 2, textYCoordinate = options.textYCoordinate ? options.textYCoordinate : textBaseline === 'top' ? 1 : textBaseline === 'center' ? gifHeight / 2 : gifHeight, font = fontWeight + ' ' + fontSize + ' ' + fontFamily, sourceX = crop ? Math.floor(crop.scaledWidth / 2) : 0, sourceWidth = crop ? videoWidth - crop.scaledWidth : 0, sourceY = crop ? Math.floor(crop.scaledHeight / 2) : 0, sourceHeight = crop ? videoHeight - crop.scaledHeight : 0, captureFrames = function captureFrame() {
        var framesLeft = pendingFrames - 1;
        if (savedRenderingContexts.length) {
          context.putImageData(savedRenderingContexts[numFrames - pendingFrames], 0, 0);
          finishCapture();
        } else {
          drawVideo();
        }
        function drawVideo() {
          try {
            if (sourceWidth > videoWidth) {
              sourceWidth = videoWidth;
            }
            if (sourceHeight > videoHeight) {
              sourceHeight = videoHeight;
            }
            if (sourceX < 0) {
              sourceX = 0;
            }
            if (sourceY < 0) {
              sourceY = 0;
            }
            context.drawImage(videoElement, sourceX, sourceY, sourceWidth, sourceHeight, 0, 0, gifWidth, gifHeight);
            finishCapture();
          } catch (e) {
            if (e.name === 'NS_ERROR_NOT_AVAILABLE') {
              utils.requestTimeout(drawVideo, 100);
            } else {
              throw e;
            }
          }
        }
        function finishCapture() {
          pendingFrames = framesLeft;
          var processedFrames = numFrames - pendingFrames;
          var imageData;
          var data;
          var rgba;
          var isBlackFrame;
          if (saveRenderingContexts) {
            renderingContextsToSave.push(context.getImageData(0, 0, gifWidth, gifHeight));
          }
          if (text) {
            context.font = font;
            context.fillStyle = fontColor;
            context.textAlign = textAlign;
            context.textBaseline = textBaseline;
            context.fillText(text, textXCoordinate, textYCoordinate);
          }
          imageData = context.getImageData(0, 0, gifWidth, gifHeight);
          data = imageData.data;
          rgba = data[0] + data[1] + data[2] + data[3];
          isBlackFrame = rgba === 0;
          if (!isBlackFrame) {
            ag.addFrameImageData(imageData);
          } else if (processedFrames === 1 && numFrames === 1) {
            drawVideo();
          }
          progressCallback(processedFrames / numFrames);
          if (framesLeft > 0) {
            utils.requestTimeout(captureFrame, waitBetweenFrames);
          }
          if (!pendingFrames) {
            ag.getBase64GIF(function (image) {
              callback({
                'error': false,
                'errorCode': '',
                'errorMsg': '',
                'image': image,
                'cameraStream': cameraStream,
                'videoElement': videoElement,
                'webcamVideoElement': webcamVideoElement,
                'savedRenderingContexts': renderingContextsToSave,
                'keepCameraOn': keepCameraOn
              });
            });
          }
        }
      };
    numFrames = numFrames != null ? numFrames : 10;
    interval = interval != null ? interval : 0.1;
    canvas.width = gifWidth;
    canvas.height = gifHeight;
    context = canvas.getContext('2d');
    (function capture() {
      if (!savedRenderingContexts.length && videoElement.currentTime === 0) {
        utils.requestTimeout(capture, 100);
        return;
      }
      captureFrames();
    }());
  },
  'getCropDimensions': function (obj) {
    var width = obj.videoWidth, height = obj.videoHeight, gifWidth = obj.gifWidth, gifHeight = obj.gifHeight, result = {
        width: 0,
        height: 0,
        scaledWidth: 0,
        scaledHeight: 0
      };
    if (width > height) {
      result.width = Math.round(width * (gifHeight / height)) - gifWidth;
      result.scaledWidth = Math.round(result.width * (height / gifHeight));
    } else {
      result.height = Math.round(height * (gifWidth / width)) - gifHeight;
      result.scaledHeight = Math.round(result.height * (width / gifWidth));
    }
    return result;
  }
};
videoStream = {
  'loadedData': false,
  'defaultVideoDimensions': {
    'width': 640,
    'height': 480
  },
  'findVideoSize': function findVideoSizeMethod(obj) {
    findVideoSizeMethod.attempts = findVideoSizeMethod.attempts || 0;
    var self = this, videoElement = obj.videoElement, cameraStream = obj.cameraStream, completedCallback = obj.completedCallback;
    if (!videoElement) {
      return;
    }
    if (videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
      videoElement.removeEventListener('loadeddata', self.findVideoSize);
      completedCallback({
        'videoElement': videoElement,
        'cameraStream': cameraStream,
        'videoWidth': videoElement.videoWidth,
        'videoHeight': videoElement.videoHeight
      });
    } else {
      if (findVideoSizeMethod.attempts < 10) {
        findVideoSizeMethod.attempts += 1;
        utils.requestTimeout(function () {
          self.findVideoSize(obj);
        }, 200);
      } else {
        completedCallback({
          'videoElement': videoElement,
          'cameraStream': cameraStream,
          'videoWidth': self.defaultVideoDimensions.width,
          'videoHeight': self.defaultVideoDimensions.height
        });
      }
    }
  },
  'onStreamingTimeout': function (callback) {
    if (utils.isFunction(callback)) {
      callback({
        'error': true,
        'errorCode': 'getUserMedia',
        'errorMsg': 'There was an issue with the getUserMedia API - Timed out while trying to start streaming',
        'image': null,
        'cameraStream': {}
      });
    }
  },
  'stream': function (obj) {
    var self = this, existingVideo = utils.isArray(obj.existingVideo) ? obj.existingVideo[0] : obj.existingVideo, videoElement = obj.videoElement, cameraStream = obj.cameraStream, streamedCallback = obj.streamedCallback, completedCallback = obj.completedCallback;
    if (utils.isFunction(streamedCallback)) {
      streamedCallback();
    }
    if (existingVideo) {
      if (utils.isString(existingVideo)) {
        videoElement.src = existingVideo;
        videoElement.innerHTML = '<source src="' + existingVideo + '" type="video/' + utils.getExtension(existingVideo) + '" />';
      }
    } else if (videoElement.mozSrcObject) {
      videoElement.mozSrcObject = cameraStream;
    } else if (utils.URL) {
      videoElement.src = utils.URL.createObjectURL(cameraStream);
    }
    videoElement.play();
    utils.requestTimeout(function checkLoadedData() {
      checkLoadedData.count = checkLoadedData.count || 0;
      if (self.loadedData === true) {
        self.findVideoSize({
          'videoElement': videoElement,
          'cameraStream': cameraStream,
          'completedCallback': completedCallback
        });
        self.loadedData = false;
      } else {
        checkLoadedData.count += 1;
        if (checkLoadedData.count > 10) {
          self.findVideoSize({
            'videoElement': videoElement,
            'cameraStream': cameraStream,
            'completedCallback': completedCallback
          });
        } else {
          checkLoadedData();
        }
      }
    }, 100);
  },
  'startStreaming': function (obj) {
    var self = this, errorCallback = utils.isFunction(obj.error) ? obj.error : utils.noop, streamedCallback = utils.isFunction(obj.streamed) ? obj.streamed : utils.noop, completedCallback = utils.isFunction(obj.completed) ? obj.completed : utils.noop, existingVideo = obj.existingVideo, webcamVideoElement = obj.webcamVideoElement, videoElement = utils.isElement(existingVideo) ? existingVideo : webcamVideoElement ? webcamVideoElement : document.createElement('video'), lastCameraStream = obj.lastCameraStream, crossOrigin = obj.crossOrigin, options = obj.options, cameraStream;
    if (crossOrigin) {
      videoElement.crossOrigin = options.crossOrigin;
    }
    videoElement.autoplay = true;
    videoElement.loop = true;
    videoElement.muted = true;
    videoElement.addEventListener('loadeddata', function (event) {
      self.loadedData = true;
    });
    if (existingVideo) {
      self.stream({
        'videoElement': videoElement,
        'existingVideo': existingVideo,
        'completedCallback': completedCallback
      });
    } else if (lastCameraStream) {
      self.stream({
        'videoElement': videoElement,
        'cameraStream': lastCameraStream,
        'streamedCallback': streamedCallback,
        'completedCallback': completedCallback
      });
    } else {
      utils.getUserMedia({ 'video': true }, function (stream) {
        self.stream({
          'videoElement': videoElement,
          'cameraStream': stream,
          'streamedCallback': streamedCallback,
          'completedCallback': completedCallback
        });
      }, errorCallback);
    }
  },
  startVideoStreaming: function (callback, options) {
    options = options || {};
    var self = this, noGetUserMediaSupportTimeout, timeoutLength = options.timeout !== undefined ? options.timeout : 0, originalCallback = options.callback, webcamVideoElement = options.webcamVideoElement;
    if (timeoutLength > 0) {
      noGetUserMediaSupportTimeout = utils.requestTimeout(function () {
        self.onStreamingTimeout(originalCallback);
      }, 10000);
    }
    this.startStreaming({
      'error': function () {
        originalCallback({
          'error': true,
          'errorCode': 'getUserMedia',
          'errorMsg': 'There was an issue with the getUserMedia API - the user probably denied permission',
          'image': null,
          'cameraStream': {}
        });
      },
      'streamed': function () {
        clearTimeout(noGetUserMediaSupportTimeout);
      },
      'completed': function (obj) {
        var cameraStream = obj.cameraStream, videoElement = obj.videoElement, videoWidth = obj.videoWidth, videoHeight = obj.videoHeight;
        callback({
          'cameraStream': cameraStream,
          'videoElement': videoElement,
          'videoWidth': videoWidth,
          'videoHeight': videoHeight
        });
      },
      'lastCameraStream': options.lastCameraStream,
      'webcamVideoElement': webcamVideoElement,
      'crossOrigin': options.crossOrigin,
      'options': options
    });
  },
  'stopVideoStreaming': function (obj) {
    obj = utils.isObject(obj) ? obj : {};
    var cameraStream = obj.cameraStream, videoElement = obj.videoElement, keepCameraOn = obj.keepCameraOn, webcamVideoElement = obj.webcamVideoElement;
    if (!keepCameraOn && cameraStream && utils.isFunction(cameraStream.stop)) {
      cameraStream.stop();
    }
    if (utils.isElement(videoElement) && !webcamVideoElement) {
      videoElement.pause();
      if (utils.isFunction(utils.URL.revokeObjectURL) && !utils.webWorkerError) {
        if (videoElement.src) {
          utils.URL.revokeObjectURL(videoElement.src);
        }
      }
      utils.removeElement(videoElement);
    }
  }
};
stopVideoStreaming = function (obj) {
  obj = utils.isObject(obj) ? obj : {};
  var options = utils.isObject(obj.options) ? obj.options : {}, cameraStream = obj.cameraStream, videoElement = obj.videoElement, webcamVideoElement = obj.webcamVideoElement, keepCameraOn = obj.keepCameraOn;
  videoStream.stopVideoStreaming({
    'cameraStream': cameraStream,
    'videoElement': videoElement,
    'keepCameraOn': keepCameraOn,
    'webcamVideoElement': webcamVideoElement
  });
};
createAndGetGIF = function (obj, callback) {
  var options = obj.options || {}, images = options.images, video = options.video, numFrames = +options.numFrames, cameraStream = obj.cameraStream, videoElement = obj.videoElement, videoWidth = obj.videoWidth, videoHeight = obj.videoHeight, gifWidth = +options.gifWidth, gifHeight = +options.gifHeight, cropDimensions = screenShot.getCropDimensions({
      'videoWidth': videoWidth,
      'videoHeight': videoHeight,
      'gifHeight': gifHeight,
      'gifWidth': gifWidth
    }), completeCallback = callback;
  options.crop = cropDimensions;
  options.videoElement = videoElement;
  options.videoWidth = videoWidth;
  options.videoHeight = videoHeight;
  options.cameraStream = cameraStream;
  if (!utils.isElement(videoElement)) {
    return;
  }
  videoElement.width = gifWidth + cropDimensions.width;
  videoElement.height = gifHeight + cropDimensions.height;
  if (!options.webcamVideoElement) {
    utils.setCSSAttr(videoElement, {
      'position': 'fixed',
      'opacity': '0'
    });
    document.body.appendChild(videoElement);
  }
  videoElement.play();
  screenShot.getGIF(options, function (obj) {
    if ((!images || !images.length) && (!video || !video.length)) {
      stopVideoStreaming(obj);
    }
    completeCallback(obj);
  });
};
existingVideo = function (obj) {
  var existingVideo = obj.existingVideo, callback = obj.callback, options = obj.options, skipObj = {
      'getUserMedia': true,
      'window.URL': true
    }, errorObj = error.validate(skipObj), loadedImages = 0, videoType, videoSrc, tempImage, ag;
  if (errorObj.error) {
    return callback(errorObj);
  }
  if (utils.isElement(existingVideo) && existingVideo.src) {
    videoSrc = existingVideo.src;
    videoType = utils.getExtension(videoSrc);
    if (!utils.isSupported.videoCodecs[videoType]) {
      return callback(error.messages.videoCodecs);
    }
  } else if (utils.isArray(existingVideo)) {
    utils.each(existingVideo, function (iterator, videoSrc) {
      videoType = videoSrc.substr(videoSrc.lastIndexOf('.') + 1, videoSrc.length);
      if (utils.isSupported.videoCodecs[videoType]) {
        existingVideo = videoSrc;
        return false;
      }
    });
  }
  videoStream.startStreaming({
    'completed': function (obj) {
      obj.options = options || {};
      createAndGetGIF(obj, callback);
    },
    'existingVideo': existingVideo,
    'crossOrigin': options.crossOrigin,
    'options': options
  });
};
existingWebcam = function (obj) {
  var lastCameraStream = obj.lastCameraStream, callback = obj.callback, webcamVideoElement = obj.webcamVideoElement, options = obj.options;
  if (!isWebCamGIFSupported()) {
    return callback(error.validate());
  }
  if (options.savedRenderingContexts.length) {
    screenShot.getWebcamGIF(options, function (obj) {
      callback(obj);
    });
    return;
  }
  videoStream.startVideoStreaming(function (obj) {
    obj.options = options || {};
    createAndGetGIF(obj, callback);
  }, {
    'lastCameraStream': lastCameraStream,
    'callback': callback,
    'webcamVideoElement': webcamVideoElement,
    'crossOrigin': options.crossOrigin
  });
};
createGIF = function (userOptions, callback) {
  callback = utils.isFunction(userOptions) ? userOptions : callback;
  userOptions = utils.isObject(userOptions) ? userOptions : {};
  if (!utils.isFunction(callback)) {
    return;
  }
  var options = utils.mergeOptions(defaultOptions, userOptions) || {}, lastCameraStream = userOptions.cameraStream, images = options.images, imagesLength = images ? images.length : 0, video = options.video, webcamVideoElement = options.webcamVideoElement;
  options = utils.mergeOptions(options, {
    'gifWidth': Math.floor(options.gifWidth),
    'gifHeight': Math.floor(options.gifHeight)
  });
  if (imagesLength) {
    existingImages({
      'images': images,
      'imagesLength': imagesLength,
      'callback': callback,
      'options': options
    });
  } else if (video) {
    existingVideo({
      'existingVideo': video,
      'callback': callback,
      'options': options
    });
  } else {
    existingWebcam({
      'lastCameraStream': lastCameraStream,
      'callback': callback,
      'webcamVideoElement': webcamVideoElement,
      'options': options
    });
  }
};
takeSnapShot = function (userOptions, callback) {
  callback = utils.isFunction(userOptions) ? userOptions : callback;
  userOptions = utils.isObject(userOptions) ? userOptions : {};
  if (!utils.isFunction(callback)) {
    return;
  }
  var mergedOptions = utils.mergeOptions(defaultOptions, userOptions), options = utils.mergeOptions(mergedOptions, {
      'interval': 0.1,
      'numFrames': 1,
      'gifWidth': Math.floor(mergedOptions.gifWidth),
      'gifHeight': Math.floor(mergedOptions.gifHeight)
    });
  createGIF(options, callback);
};
API = function (utils, error, defaultOptions, isSupported, isWebCamGIFSupported, isExistingImagesGIFSupported, isExistingVideoGIFSupported, createGIF, takeSnapShot, stopVideoStreaming) {
  var gifshot = {
    'utils': utils,
    'error': error,
    'defaultOptions': defaultOptions,
    'createGIF': createGIF,
    'takeSnapShot': takeSnapShot,
    'stopVideoStreaming': stopVideoStreaming,
    'isSupported': isSupported,
    'isWebCamGIFSupported': isWebCamGIFSupported,
    'isExistingVideoGIFSupported': isExistingVideoGIFSupported,
    'isExistingImagesGIFSupported': isExistingImagesGIFSupported,
    'VERSION': '0.3.2'
  };
  return gifshot;
}(utils, error, defaultOptions, isSupported, isWebCamGIFSupported, isExistingImagesGIFSupported, isExistingVideoGIFSupported, createGIF, takeSnapShot, stopVideoStreaming);
(function (API) {
  if (typeof define === 'function' && define.amd) {
    define([], function () {
      return API;
    });
  } else if (typeof exports !== 'undefined') {
    module.exports = API;
  } else {
    window.gifshot = API;
  }
}(API));
}(typeof window !== "undefined" ? window : {}, typeof document !== "undefined" ? document : { createElement: function() {} }, typeof window !== "undefined" ? window.navigator : {}));
},{}],5:[function(require,module,exports){
var now = require('performance-now')
  , global = typeof window === 'undefined' ? {} : window
  , vendors = ['moz', 'webkit']
  , suffix = 'AnimationFrame'
  , raf = global['request' + suffix]
  , caf = global['cancel' + suffix] || global['cancelRequest' + suffix]

for(var i = 0; i < vendors.length && !raf; i++) {
  raf = global[vendors[i] + 'Request' + suffix]
  caf = global[vendors[i] + 'Cancel' + suffix]
      || global[vendors[i] + 'CancelRequest' + suffix]
}

// Some versions of FF have rAF but not cAF
if(!raf || !caf) {
  var last = 0
    , id = 0
    , queue = []
    , frameDuration = 1000 / 60

  raf = function(callback) {
    if(queue.length === 0) {
      var _now = now()
        , next = Math.max(0, frameDuration - (_now - last))
      last = next + _now
      setTimeout(function() {
        var cp = queue.slice(0)
        // Clear queue here to prevent
        // callbacks from appending listeners
        // to the current frame's queue
        queue.length = 0
        for(var i = 0; i < cp.length; i++) {
          if(!cp[i].cancelled) {
            try{
              cp[i].callback(last)
            } catch(e) {
              setTimeout(function() { throw e }, 0)
            }
          }
        }
      }, Math.round(next))
    }
    queue.push({
      handle: ++id,
      callback: callback,
      cancelled: false
    })
    return id
  }

  caf = function(handle) {
    for(var i = 0; i < queue.length; i++) {
      if(queue[i].handle === handle) {
        queue[i].cancelled = true
      }
    }
  }
}

module.exports = function(fn) {
  // Wrap in a new function to prevent
  // `cancel` potentially being assigned
  // to the native rAF function
  return raf.call(global, fn)
}
module.exports.cancel = function() {
  caf.apply(global, arguments)
}

},{"performance-now":6}],6:[function(require,module,exports){
(function (process){
// Generated by CoffeeScript 1.7.1
(function() {
  var getNanoSeconds, hrtime, loadTime;

  if ((typeof performance !== "undefined" && performance !== null) && performance.now) {
    module.exports = function() {
      return performance.now();
    };
  } else if ((typeof process !== "undefined" && process !== null) && process.hrtime) {
    module.exports = function() {
      return (getNanoSeconds() - loadTime) / 1e6;
    };
    hrtime = process.hrtime;
    getNanoSeconds = function() {
      var hr;
      hr = hrtime();
      return hr[0] * 1e9 + hr[1];
    };
    loadTime = getNanoSeconds();
  } else if (Date.now) {
    module.exports = function() {
      return Date.now() - loadTime;
    };
    loadTime = Date.now();
  } else {
    module.exports = function() {
      return new Date().getTime() - loadTime;
    };
    loadTime = new Date().getTime();
  }

}).call(this);

}).call(this,require('_process'))

},{"_process":2}],7:[function(require,module,exports){
'use strict';

Object.defineProperty(exports, '__esModule', {
  value: true
});

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i]; return arr2; } else { return Array.from(arr); } }

var _assignment = require('assignment');

var _assignment2 = _interopRequireDefault(_assignment);

var _raf = require('raf');

var _raf2 = _interopRequireDefault(_raf);

var _computedStyle = require('computed-style');

var _computedStyle2 = _interopRequireDefault(_computedStyle);

var _gifshot = require('gifshot');

var _gifshot2 = _interopRequireDefault(_gifshot);

function vectorcam(svg) {
  var options = arguments.length <= 1 || arguments[1] === undefined ? {} : arguments[1];

  var props = [// copied from classes through computed-style
  'background-color', 'color', 'dominant-baseline', 'fill', 'font-family', 'font-size', 'opacity', 'r', 'stroke', 'stroke-dasharray', 'stroke-width', 'text-anchor'];
  var defaults = {
    fps: 4
  };
  var o = (0, _assignment2['default'])({}, defaults, options);
  var frames = [];
  var recording = false;
  var lastCapture = -Infinity;
  var captureInterval = 1000 / o.fps;
  var cam = Object.defineProperties({
    start: function start() {
      cam.reset();
      recording = true;
      (0, _raf2['default'])(record);
      return cam;
    },
    stop: function stop(done) {
      var rect = svg.getBoundingClientRect();
      var width = rect.width;
      var height = rect.height;

      recording = false;
      frames = frames.map(function (f) {
        return f // resize all frames to final width and height
        .replace(/width="\d+"/, 'width="' + width + '"').replace(/height="\d+"/, 'height="' + height + '"');
      });

      if (!done) {
        return;
      }
      var options = {
        images: frames,
        gifWidth: width,
        gifHeight: height
      };
      _gifshot2['default'].createGIF(options, function (res) {
        return done(res.error, res.image);
      });
      return cam;
    },
    add: function add(frame) {
      frames.push(frame);
    },
    snap: snap,
    reset: function reset() {
      frames = [];
      cam.pause();
      return cam;
    },
    pause: function pause() {
      recording = false;
      return cam;
    },
    resume: function resume() {
      recording = true;
      return cam;
    }
  }, {
    frames: {
      get: function get() {
        return [].concat(_toConsumableArray(frames));
      },
      configurable: true,
      enumerable: true
    },
    recording: {
      get: function get() {
        return recording;
      },
      configurable: true,
      enumerable: true
    }
  });

  return cam;

  function record(diff) {
    if (diff - lastCapture > captureInterval) {
      lastCapture = diff;
      snap();
    }
    if (recording) {
      (0, _raf2['default'])(record);
    }
  }

  function snap() {
    var mirror = svg.cloneNode(true);
    document.body.appendChild(mirror);
    [].concat(_toConsumableArray(mirror.querySelectorAll('*'))).forEach(function (el) {
      props.forEach(function (prop) {
        return el.style[prop] = (0, _computedStyle2['default'])(el, prop);
      });
    });
    var serialized = new XMLSerializer().serializeToString(mirror);
    cam.add('data:image/svg+xml;utf8,' + serialized);
    document.body.removeChild(mirror);
  }
}

exports['default'] = vectorcam;
module.exports = exports['default'];

},{"assignment":1,"computed-style":3,"gifshot":4,"raf":5}]},{},[7])(7)
});
//# sourceMappingURL=data:application/json;charset:utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIm5vZGVfbW9kdWxlcy9icm93c2VyaWZ5L25vZGVfbW9kdWxlcy9icm93c2VyLXBhY2svX3ByZWx1ZGUuanMiLCJub2RlX21vZHVsZXMvYXNzaWdubWVudC9hc3NpZ25tZW50LmpzIiwibm9kZV9tb2R1bGVzL2Jyb3dzZXJpZnkvbm9kZV9tb2R1bGVzL3Byb2Nlc3MvYnJvd3Nlci5qcyIsIm5vZGVfbW9kdWxlcy9jb21wdXRlZC1zdHlsZS9kaXN0L2NvbXB1dGVkU3R5bGUuY29tbW9uanMuanMiLCJub2RlX21vZHVsZXMvZ2lmc2hvdC9idWlsZC9naWZzaG90LmpzIiwibm9kZV9tb2R1bGVzL3JhZi9pbmRleC5qcyIsIm5vZGVfbW9kdWxlcy9yYWYvbm9kZV9tb2R1bGVzL3BlcmZvcm1hbmNlLW5vdy9saWIvcGVyZm9ybWFuY2Utbm93LmpzIiwiL1VzZXJzL25pY28vZGV2L3ZlY3RvcmNhbS92ZWN0b3JjYW0uanMiXSwibmFtZXMiOltdLCJtYXBwaW5ncyI6IkFBQUE7QUNBQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDMUJBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7O0FDM0ZBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBOztBQzNCQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7QUNwckRBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7O0FDcEVBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTtBQUNBO0FBQ0E7QUFDQTs7Ozs7Ozs7Ozs7Ozs7MEJDaENtQixZQUFZOzs7O21CQUNmLEtBQUs7Ozs7NkJBQ0ssZ0JBQWdCOzs7O3VCQUN0QixTQUFTOzs7O0FBRTdCLFNBQVMsU0FBUyxDQUFFLEdBQUcsRUFBYztNQUFaLE9BQU8seURBQUMsRUFBRTs7QUFDakMsTUFBSSxLQUFLLEdBQUc7QUFDVixvQkFBa0IsRUFDbEIsT0FBTyxFQUNQLG1CQUFtQixFQUNuQixNQUFNLEVBQ04sYUFBYSxFQUNiLFdBQVcsRUFDWCxTQUFTLEVBQ1QsR0FBRyxFQUNILFFBQVEsRUFDUixrQkFBa0IsRUFDbEIsY0FBYyxFQUNkLGFBQWEsQ0FDZCxDQUFBO0FBQ0QsTUFBSSxRQUFRLEdBQUc7QUFDYixPQUFHLEVBQUUsQ0FBQztHQUNQLENBQUE7QUFDRCxNQUFJLENBQUMsR0FBRyw2QkFBTyxFQUFFLEVBQUUsUUFBUSxFQUFFLE9BQU8sQ0FBQyxDQUFBO0FBQ3JDLE1BQUksTUFBTSxHQUFHLEVBQUUsQ0FBQTtBQUNmLE1BQUksU0FBUyxHQUFHLEtBQUssQ0FBQTtBQUNyQixNQUFJLFdBQVcsR0FBRyxDQUFDLFFBQVEsQ0FBQTtBQUMzQixNQUFJLGVBQWUsR0FBRyxJQUFJLEdBQUcsQ0FBQyxDQUFDLEdBQUcsQ0FBQTtBQUNsQyxNQUFJLEdBQUcsMkJBQUc7QUFHUixTQUFLLEVBQUMsaUJBQUc7QUFDUCxTQUFHLENBQUMsS0FBSyxFQUFFLENBQUE7QUFDWCxlQUFTLEdBQUcsSUFBSSxDQUFBO0FBQ2hCLDRCQUFJLE1BQU0sQ0FBQyxDQUFBO0FBQ1gsYUFBTyxHQUFHLENBQUE7S0FDWDtBQUNELFFBQUksRUFBQyxjQUFDLElBQUksRUFBRTtBQUNWLFVBQUksSUFBSSxHQUFHLEdBQUcsQ0FBQyxxQkFBcUIsRUFBRSxDQUFBO0FBQ3RDLFVBQUksS0FBSyxHQUFHLElBQUksQ0FBQyxLQUFLLENBQUE7QUFDdEIsVUFBSSxNQUFNLEdBQUcsSUFBSSxDQUFDLE1BQU0sQ0FBQTs7QUFFeEIsZUFBUyxHQUFHLEtBQUssQ0FBQTtBQUNqQixZQUFNLEdBQUcsTUFBTSxDQUFDLEdBQUcsQ0FBQyxVQUFBLENBQUM7ZUFBSSxDQUFDO1NBQ3ZCLE9BQU8sQ0FBQyxhQUFhLGNBQVksS0FBSyxPQUFJLENBQzFDLE9BQU8sQ0FBQyxjQUFjLGVBQWEsTUFBTSxPQUFJO09BQUEsQ0FDL0MsQ0FBQTs7QUFFRCxVQUFJLENBQUMsSUFBSSxFQUFFO0FBQ1QsZUFBTTtPQUNQO0FBQ0QsVUFBSSxPQUFPLEdBQUc7QUFDWixjQUFNLEVBQUUsTUFBTTtBQUNkLGdCQUFRLEVBQUUsS0FBSztBQUNmLGlCQUFTLEVBQUUsTUFBTTtPQUNsQixDQUFBO0FBQ0QsMkJBQVEsU0FBUyxDQUFDLE9BQU8sRUFBRSxVQUFBLEdBQUc7ZUFBSSxJQUFJLENBQUMsR0FBRyxDQUFDLEtBQUssRUFBRSxHQUFHLENBQUMsS0FBSyxDQUFDO09BQUEsQ0FBQyxDQUFBO0FBQzdELGFBQU8sR0FBRyxDQUFBO0tBQ1g7QUFDRCxPQUFHLEVBQUMsYUFBQyxLQUFLLEVBQUU7QUFDVixZQUFNLENBQUMsSUFBSSxDQUFDLEtBQUssQ0FBQyxDQUFBO0tBQ25CO0FBQ0QsUUFBSSxFQUFKLElBQUk7QUFDSixTQUFLLEVBQUMsaUJBQUc7QUFDUCxZQUFNLEdBQUcsRUFBRSxDQUFBO0FBQ1gsU0FBRyxDQUFDLEtBQUssRUFBRSxDQUFBO0FBQ1gsYUFBTyxHQUFHLENBQUE7S0FDWDtBQUNELFNBQUssRUFBQyxpQkFBRztBQUNQLGVBQVMsR0FBRyxLQUFLLENBQUE7QUFDakIsYUFBTyxHQUFHLENBQUE7S0FDWDtBQUNELFVBQU0sRUFBQyxrQkFBRztBQUNSLGVBQVMsR0FBRyxJQUFJLENBQUE7QUFDaEIsYUFBTyxHQUFHLENBQUE7S0FDWDtHQUNGO0FBL0NLLFVBQU07V0FBQyxlQUFHO0FBQUUsNENBQVcsTUFBTSxHQUFDO09BQUU7Ozs7QUFDaEMsYUFBUztXQUFDLGVBQUc7QUFBRSxlQUFPLFNBQVMsQ0FBQTtPQUFFOzs7O0lBOEN0QyxDQUFBOztBQUVELFNBQU8sR0FBRyxDQUFBOztBQUVWLFdBQVMsTUFBTSxDQUFFLElBQUksRUFBRTtBQUNyQixRQUFJLElBQUksR0FBRyxXQUFXLEdBQUcsZUFBZSxFQUFFO0FBQ3hDLGlCQUFXLEdBQUcsSUFBSSxDQUFBO0FBQ2xCLFVBQUksRUFBRSxDQUFBO0tBQ1A7QUFDRCxRQUFJLFNBQVMsRUFBRTtBQUNiLDRCQUFJLE1BQU0sQ0FBQyxDQUFBO0tBQ1o7R0FDRjs7QUFFRCxXQUFTLElBQUksR0FBSTtBQUNmLFFBQUksTUFBTSxHQUFHLEdBQUcsQ0FBQyxTQUFTLENBQUMsSUFBSSxDQUFDLENBQUE7QUFDaEMsWUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUM7QUFDbEMsaUNBQUksTUFBTSxDQUFDLGdCQUFnQixDQUFDLEdBQUcsQ0FBQyxHQUFFLE9BQU8sQ0FBQyxVQUFBLEVBQUUsRUFBSTtBQUM5QyxXQUFLLENBQUMsT0FBTyxDQUFDLFVBQUEsSUFBSTtlQUFJLEVBQUUsQ0FBQyxLQUFLLENBQUMsSUFBSSxDQUFDLEdBQUcsZ0NBQWMsRUFBRSxFQUFFLElBQUksQ0FBQztPQUFBLENBQUMsQ0FBQTtLQUNoRSxDQUFDLENBQUE7QUFDRixRQUFJLFVBQVUsR0FBRyxJQUFJLGFBQWEsRUFBRSxDQUFDLGlCQUFpQixDQUFDLE1BQU0sQ0FBQyxDQUFBO0FBQzlELE9BQUcsQ0FBQyxHQUFHLENBQUMsMEJBQTBCLEdBQUcsVUFBVSxDQUFDLENBQUE7QUFDaEQsWUFBUSxDQUFDLElBQUksQ0FBQyxXQUFXLENBQUMsTUFBTSxDQUFDLENBQUE7R0FDbEM7Q0FDRjs7cUJBRWMsU0FBUyIsImZpbGUiOiJnZW5lcmF0ZWQuanMiLCJzb3VyY2VSb290IjoiIiwic291cmNlc0NvbnRlbnQiOlsiKGZ1bmN0aW9uIGUodCxuLHIpe2Z1bmN0aW9uIHMobyx1KXtpZighbltvXSl7aWYoIXRbb10pe3ZhciBhPXR5cGVvZiByZXF1aXJlPT1cImZ1bmN0aW9uXCImJnJlcXVpcmU7aWYoIXUmJmEpcmV0dXJuIGEobywhMCk7aWYoaSlyZXR1cm4gaShvLCEwKTt2YXIgZj1uZXcgRXJyb3IoXCJDYW5ub3QgZmluZCBtb2R1bGUgJ1wiK28rXCInXCIpO3Rocm93IGYuY29kZT1cIk1PRFVMRV9OT1RfRk9VTkRcIixmfXZhciBsPW5bb109e2V4cG9ydHM6e319O3Rbb11bMF0uY2FsbChsLmV4cG9ydHMsZnVuY3Rpb24oZSl7dmFyIG49dFtvXVsxXVtlXTtyZXR1cm4gcyhuP246ZSl9LGwsbC5leHBvcnRzLGUsdCxuLHIpfXJldHVybiBuW29dLmV4cG9ydHN9dmFyIGk9dHlwZW9mIHJlcXVpcmU9PVwiZnVuY3Rpb25cIiYmcmVxdWlyZTtmb3IodmFyIG89MDtvPHIubGVuZ3RoO28rKylzKHJbb10pO3JldHVybiBzfSkiLCIndXNlIHN0cmljdCc7XG5cbmZ1bmN0aW9uIGFzc2lnbm1lbnQgKHJlc3VsdCkge1xuICB2YXIgc3RhY2sgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChhcmd1bWVudHMsIDEpO1xuICB2YXIgaXRlbTtcbiAgdmFyIGtleTtcbiAgd2hpbGUgKHN0YWNrLmxlbmd0aCkge1xuICAgIGl0ZW0gPSBzdGFjay5zaGlmdCgpO1xuICAgIGZvciAoa2V5IGluIGl0ZW0pIHtcbiAgICAgIGlmIChpdGVtLmhhc093blByb3BlcnR5KGtleSkpIHtcbiAgICAgICAgaWYgKHR5cGVvZiByZXN1bHRba2V5XSA9PT0gJ29iamVjdCcgJiYgcmVzdWx0W2tleV0gJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKHJlc3VsdFtrZXldKSAhPT0gJ1tvYmplY3QgQXJyYXldJykge1xuICAgICAgICAgIGlmICh0eXBlb2YgaXRlbVtrZXldID09PSAnb2JqZWN0JyAmJiBpdGVtW2tleV0gIT09IG51bGwpIHtcbiAgICAgICAgICAgIHJlc3VsdFtrZXldID0gYXNzaWdubWVudChyZXN1bHRba2V5XSwgaXRlbVtrZXldKTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgcmVzdWx0W2tleV0gPSBpdGVtW2tleV07XG4gICAgICAgICAgfVxuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIHJlc3VsdFtrZXldID0gaXRlbVtrZXldO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgfVxuICB9XG4gIHJldHVybiByZXN1bHQ7XG59XG5cbm1vZHVsZS5leHBvcnRzID0gYXNzaWdubWVudDtcbiIsIi8vIHNoaW0gZm9yIHVzaW5nIHByb2Nlc3MgaW4gYnJvd3NlclxuXG52YXIgcHJvY2VzcyA9IG1vZHVsZS5leHBvcnRzID0ge307XG52YXIgcXVldWUgPSBbXTtcbnZhciBkcmFpbmluZyA9IGZhbHNlO1xudmFyIGN1cnJlbnRRdWV1ZTtcbnZhciBxdWV1ZUluZGV4ID0gLTE7XG5cbmZ1bmN0aW9uIGNsZWFuVXBOZXh0VGljaygpIHtcbiAgICBkcmFpbmluZyA9IGZhbHNlO1xuICAgIGlmIChjdXJyZW50UXVldWUubGVuZ3RoKSB7XG4gICAgICAgIHF1ZXVlID0gY3VycmVudFF1ZXVlLmNvbmNhdChxdWV1ZSk7XG4gICAgfSBlbHNlIHtcbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgIH1cbiAgICBpZiAocXVldWUubGVuZ3RoKSB7XG4gICAgICAgIGRyYWluUXVldWUoKTtcbiAgICB9XG59XG5cbmZ1bmN0aW9uIGRyYWluUXVldWUoKSB7XG4gICAgaWYgKGRyYWluaW5nKSB7XG4gICAgICAgIHJldHVybjtcbiAgICB9XG4gICAgdmFyIHRpbWVvdXQgPSBzZXRUaW1lb3V0KGNsZWFuVXBOZXh0VGljayk7XG4gICAgZHJhaW5pbmcgPSB0cnVlO1xuXG4gICAgdmFyIGxlbiA9IHF1ZXVlLmxlbmd0aDtcbiAgICB3aGlsZShsZW4pIHtcbiAgICAgICAgY3VycmVudFF1ZXVlID0gcXVldWU7XG4gICAgICAgIHF1ZXVlID0gW107XG4gICAgICAgIHdoaWxlICgrK3F1ZXVlSW5kZXggPCBsZW4pIHtcbiAgICAgICAgICAgIGlmIChjdXJyZW50UXVldWUpIHtcbiAgICAgICAgICAgICAgICBjdXJyZW50UXVldWVbcXVldWVJbmRleF0ucnVuKCk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcXVldWVJbmRleCA9IC0xO1xuICAgICAgICBsZW4gPSBxdWV1ZS5sZW5ndGg7XG4gICAgfVxuICAgIGN1cnJlbnRRdWV1ZSA9IG51bGw7XG4gICAgZHJhaW5pbmcgPSBmYWxzZTtcbiAgICBjbGVhclRpbWVvdXQodGltZW91dCk7XG59XG5cbnByb2Nlc3MubmV4dFRpY2sgPSBmdW5jdGlvbiAoZnVuKSB7XG4gICAgdmFyIGFyZ3MgPSBuZXcgQXJyYXkoYXJndW1lbnRzLmxlbmd0aCAtIDEpO1xuICAgIGlmIChhcmd1bWVudHMubGVuZ3RoID4gMSkge1xuICAgICAgICBmb3IgKHZhciBpID0gMTsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgYXJnc1tpIC0gMV0gPSBhcmd1bWVudHNbaV07XG4gICAgICAgIH1cbiAgICB9XG4gICAgcXVldWUucHVzaChuZXcgSXRlbShmdW4sIGFyZ3MpKTtcbiAgICBpZiAocXVldWUubGVuZ3RoID09PSAxICYmICFkcmFpbmluZykge1xuICAgICAgICBzZXRUaW1lb3V0KGRyYWluUXVldWUsIDApO1xuICAgIH1cbn07XG5cbi8vIHY4IGxpa2VzIHByZWRpY3RpYmxlIG9iamVjdHNcbmZ1bmN0aW9uIEl0ZW0oZnVuLCBhcnJheSkge1xuICAgIHRoaXMuZnVuID0gZnVuO1xuICAgIHRoaXMuYXJyYXkgPSBhcnJheTtcbn1cbkl0ZW0ucHJvdG90eXBlLnJ1biA9IGZ1bmN0aW9uICgpIHtcbiAgICB0aGlzLmZ1bi5hcHBseShudWxsLCB0aGlzLmFycmF5KTtcbn07XG5wcm9jZXNzLnRpdGxlID0gJ2Jyb3dzZXInO1xucHJvY2Vzcy5icm93c2VyID0gdHJ1ZTtcbnByb2Nlc3MuZW52ID0ge307XG5wcm9jZXNzLmFyZ3YgPSBbXTtcbnByb2Nlc3MudmVyc2lvbiA9ICcnOyAvLyBlbXB0eSBzdHJpbmcgdG8gYXZvaWQgcmVnZXhwIGlzc3Vlc1xucHJvY2Vzcy52ZXJzaW9ucyA9IHt9O1xuXG5mdW5jdGlvbiBub29wKCkge31cblxucHJvY2Vzcy5vbiA9IG5vb3A7XG5wcm9jZXNzLmFkZExpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3Mub25jZSA9IG5vb3A7XG5wcm9jZXNzLm9mZiA9IG5vb3A7XG5wcm9jZXNzLnJlbW92ZUxpc3RlbmVyID0gbm9vcDtcbnByb2Nlc3MucmVtb3ZlQWxsTGlzdGVuZXJzID0gbm9vcDtcbnByb2Nlc3MuZW1pdCA9IG5vb3A7XG5cbnByb2Nlc3MuYmluZGluZyA9IGZ1bmN0aW9uIChuYW1lKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmJpbmRpbmcgaXMgbm90IHN1cHBvcnRlZCcpO1xufTtcblxucHJvY2Vzcy5jd2QgPSBmdW5jdGlvbiAoKSB7IHJldHVybiAnLycgfTtcbnByb2Nlc3MuY2hkaXIgPSBmdW5jdGlvbiAoZGlyKSB7XG4gICAgdGhyb3cgbmV3IEVycm9yKCdwcm9jZXNzLmNoZGlyIGlzIG5vdCBzdXBwb3J0ZWQnKTtcbn07XG5wcm9jZXNzLnVtYXNrID0gZnVuY3Rpb24oKSB7IHJldHVybiAwOyB9O1xuIiwiLy8gREVWOiBXZSBkb24ndCB1c2UgdmFyIGJ1dCBmYXZvciBwYXJhbWV0ZXJzIHNpbmNlIHRoZXNlIHBsYXkgbmljZXIgd2l0aCBtaW5pZmljYXRpb25cbmZ1bmN0aW9uIGNvbXB1dGVkU3R5bGUoZWwsIHByb3AsIGdldENvbXB1dGVkU3R5bGUsIHN0eWxlKSB7XG4gIGdldENvbXB1dGVkU3R5bGUgPSB3aW5kb3cuZ2V0Q29tcHV0ZWRTdHlsZTtcbiAgc3R5bGUgPVxuICAgICAgLy8gSWYgd2UgaGF2ZSBnZXRDb21wdXRlZFN0eWxlXG4gICAgICBnZXRDb21wdXRlZFN0eWxlID9cbiAgICAgICAgLy8gUXVlcnkgaXRcbiAgICAgICAgLy8gVE9ETzogRnJvbSBDU1MtUXVlcnkgbm90ZXMsIHdlIG1pZ2h0IG5lZWQgKG5vZGUsIG51bGwpIGZvciBGRlxuICAgICAgICBnZXRDb21wdXRlZFN0eWxlKGVsKSA6XG5cbiAgICAgIC8vIE90aGVyd2lzZSwgd2UgYXJlIGluIElFIGFuZCB1c2UgY3VycmVudFN0eWxlXG4gICAgICAgIGVsLmN1cnJlbnRTdHlsZTtcbiAgaWYgKHN0eWxlKSB7XG4gICAgcmV0dXJuIHN0eWxlXG4gICAgW1xuICAgICAgLy8gU3dpdGNoIHRvIGNhbWVsQ2FzZSBmb3IgQ1NTT01cbiAgICAgIC8vIERFVjogR3JhYmJlZCBmcm9tIGpRdWVyeVxuICAgICAgLy8gaHR0cHM6Ly9naXRodWIuY29tL2pxdWVyeS9qcXVlcnkvYmxvYi8xLjktc3RhYmxlL3NyYy9jc3MuanMjTDE5MS1MMTk0XG4gICAgICAvLyBodHRwczovL2dpdGh1Yi5jb20vanF1ZXJ5L2pxdWVyeS9ibG9iLzEuOS1zdGFibGUvc3JjL2NvcmUuanMjTDU5My1MNTk3XG4gICAgICBwcm9wLnJlcGxhY2UoLy0oXFx3KS9naSwgZnVuY3Rpb24gKHdvcmQsIGxldHRlcikge1xuICAgICAgICByZXR1cm4gbGV0dGVyLnRvVXBwZXJDYXNlKCk7XG4gICAgICB9KVxuICAgIF07XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBjb21wdXRlZFN0eWxlO1xuIiwiLypDb3B5cmlnaHRzIGZvciBjb2RlIGF1dGhvcmVkIGJ5IFlhaG9vIEluYy4gaXMgbGljZW5zZWQgdW5kZXIgdGhlIGZvbGxvd2luZyB0ZXJtczpcbk1JVCBMaWNlbnNlXG5Db3B5cmlnaHQgIDIwMTUgWWFob28gSW5jLlxuUGVybWlzc2lvbiBpcyBoZXJlYnkgZ3JhbnRlZCwgZnJlZSBvZiBjaGFyZ2UsIHRvIGFueSBwZXJzb24gb2J0YWluaW5nIGEgY29weSBvZiB0aGlzIHNvZnR3YXJlIGFuZCBhc3NvY2lhdGVkIGRvY3VtZW50YXRpb24gZmlsZXMgKHRoZSBcIlNvZnR3YXJlXCIpLCB0byBkZWFsIGluIHRoZSBTb2Z0d2FyZSB3aXRob3V0IHJlc3RyaWN0aW9uLCBpbmNsdWRpbmcgd2l0aG91dCBsaW1pdGF0aW9uIHRoZSByaWdodHMgdG8gdXNlLCBjb3B5LCBtb2RpZnksIG1lcmdlLCBwdWJsaXNoLCBkaXN0cmlidXRlLCBzdWJsaWNlbnNlLCBhbmQvb3Igc2VsbCBjb3BpZXMgb2YgdGhlIFNvZnR3YXJlLCBhbmQgdG8gcGVybWl0IHBlcnNvbnMgdG8gd2hvbSB0aGUgU29mdHdhcmUgaXMgZnVybmlzaGVkIHRvIGRvIHNvLCBzdWJqZWN0IHRvIHRoZSBmb2xsb3dpbmcgY29uZGl0aW9uczpcblRoZSBhYm92ZSBjb3B5cmlnaHQgbm90aWNlIGFuZCB0aGlzIHBlcm1pc3Npb24gbm90aWNlIHNoYWxsIGJlIGluY2x1ZGVkIGluIGFsbCBjb3BpZXMgb3Igc3Vic3RhbnRpYWwgcG9ydGlvbnMgb2YgdGhlIFNvZnR3YXJlLlxuVEhFIFNPRlRXQVJFIElTIFBST1ZJREVEIFwiQVMgSVNcIiwgV0lUSE9VVCBXQVJSQU5UWSBPRiBBTlkgS0lORCwgRVhQUkVTUyBPUiBJTVBMSUVELCBJTkNMVURJTkcgQlVUIE5PVCBMSU1JVEVEIFRPIFRIRSBXQVJSQU5USUVTIE9GIE1FUkNIQU5UQUJJTElUWSwgRklUTkVTUyBGT1IgQSBQQVJUSUNVTEFSIFBVUlBPU0UgQU5EIE5PTklORlJJTkdFTUVOVC4gSU4gTk8gRVZFTlQgU0hBTEwgVEhFIEFVVEhPUlMgT1IgQ09QWVJJR0hUIEhPTERFUlMgQkUgTElBQkxFIEZPUiBBTlkgQ0xBSU0sIERBTUFHRVMgT1IgT1RIRVIgTElBQklMSVRZLCBXSEVUSEVSIElOIEFOIEFDVElPTiBPRiBDT05UUkFDVCwgVE9SVCBPUiBPVEhFUldJU0UsIEFSSVNJTkcgRlJPTSwgT1VUIE9GIE9SIElOIENPTk5FQ1RJT04gV0lUSCBUSEUgU09GVFdBUkUgT1IgVEhFIFVTRSBPUiBPVEhFUiBERUFMSU5HUyBJTiBUSEUgU09GVFdBUkUuXG4qL1xuOyhmdW5jdGlvbih3aW5kb3csIGRvY3VtZW50LCBuYXZpZ2F0b3IsIHVuZGVmaW5lZCkge1xudmFyIHV0aWxzLCBlcnJvciwgZGVmYXVsdE9wdGlvbnMsIGlzU3VwcG9ydGVkLCBpc1dlYkNhbUdJRlN1cHBvcnRlZCwgaXNFeGlzdGluZ0ltYWdlc0dJRlN1cHBvcnRlZCwgaXNFeGlzdGluZ1ZpZGVvR0lGU3VwcG9ydGVkLCBOZXVRdWFudCwgcHJvY2Vzc0ZyYW1lV29ya2VyLCBnaWZXcml0ZXIsIEFuaW1hdGVkR0lGLCBnZXRCYXNlNjRHSUYsIGV4aXN0aW5nSW1hZ2VzLCBzY3JlZW5TaG90LCB2aWRlb1N0cmVhbSwgc3RvcFZpZGVvU3RyZWFtaW5nLCBjcmVhdGVBbmRHZXRHSUYsIGV4aXN0aW5nVmlkZW8sIGV4aXN0aW5nV2ViY2FtLCBjcmVhdGVHSUYsIHRha2VTbmFwU2hvdCwgQVBJO1xudXRpbHMgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciB1dGlscyA9IHtcbiAgICAnVVJMJzogd2luZG93LlVSTCB8fCB3aW5kb3cud2Via2l0VVJMIHx8IHdpbmRvdy5tb3pVUkwgfHwgd2luZG93Lm1zVVJMLFxuICAgICdnZXRVc2VyTWVkaWEnOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgZ2V0VXNlck1lZGlhID0gbmF2aWdhdG9yLmdldFVzZXJNZWRpYSB8fCBuYXZpZ2F0b3Iud2Via2l0R2V0VXNlck1lZGlhIHx8IG5hdmlnYXRvci5tb3pHZXRVc2VyTWVkaWEgfHwgbmF2aWdhdG9yLm1zR2V0VXNlck1lZGlhO1xuICAgICAgcmV0dXJuIGdldFVzZXJNZWRpYSA/IGdldFVzZXJNZWRpYS5iaW5kKG5hdmlnYXRvcikgOiBnZXRVc2VyTWVkaWE7XG4gICAgfSgpLFxuICAgICdyZXF1ZXN0QW5pbUZyYW1lJzogd2luZG93LnJlcXVlc3RBbmltYXRpb25GcmFtZSB8fCB3aW5kb3cud2Via2l0UmVxdWVzdEFuaW1hdGlvbkZyYW1lIHx8IHdpbmRvdy5tb3pSZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm9SZXF1ZXN0QW5pbWF0aW9uRnJhbWUgfHwgd2luZG93Lm1zUmVxdWVzdEFuaW1hdGlvbkZyYW1lLFxuICAgICdyZXF1ZXN0VGltZW91dCc6IGZ1bmN0aW9uIChjYWxsYmFjaywgZGVsYXkpIHtcbiAgICAgIGNhbGxiYWNrID0gY2FsbGJhY2sgfHwgdXRpbHMubm9vcDtcbiAgICAgIGRlbGF5ID0gZGVsYXkgfHwgMDtcbiAgICAgIGlmICghdXRpbHMucmVxdWVzdEFuaW1GcmFtZSkge1xuICAgICAgICByZXR1cm4gc2V0VGltZW91dChjYWxsYmFjaywgZGVsYXkpO1xuICAgICAgfVxuICAgICAgdmFyIHN0YXJ0ID0gbmV3IERhdGUoKS5nZXRUaW1lKCksIGhhbmRsZSA9IG5ldyBPYmplY3QoKSwgcmVxdWVzdEFuaW1GcmFtZSA9IHV0aWxzLnJlcXVlc3RBbmltRnJhbWU7XG4gICAgICBmdW5jdGlvbiBsb29wKCkge1xuICAgICAgICB2YXIgY3VycmVudCA9IG5ldyBEYXRlKCkuZ2V0VGltZSgpLCBkZWx0YSA9IGN1cnJlbnQgLSBzdGFydDtcbiAgICAgICAgZGVsdGEgPj0gZGVsYXkgPyBjYWxsYmFjay5jYWxsKCkgOiBoYW5kbGUudmFsdWUgPSByZXF1ZXN0QW5pbUZyYW1lKGxvb3ApO1xuICAgICAgfVxuICAgICAgaGFuZGxlLnZhbHVlID0gcmVxdWVzdEFuaW1GcmFtZShsb29wKTtcbiAgICAgIHJldHVybiBoYW5kbGU7XG4gICAgfSxcbiAgICAnQmxvYic6IHdpbmRvdy5CbG9iIHx8IHdpbmRvdy5CbG9iQnVpbGRlciB8fCB3aW5kb3cuV2ViS2l0QmxvYkJ1aWxkZXIgfHwgd2luZG93Lk1vekJsb2JCdWlsZGVyIHx8IHdpbmRvdy5NU0Jsb2JCdWlsZGVyLFxuICAgICdidG9hJzogZnVuY3Rpb24gKCkge1xuICAgICAgdmFyIGJ0b2EgPSB3aW5kb3cuYnRvYSB8fCBmdW5jdGlvbiAoaW5wdXQpIHtcbiAgICAgICAgdmFyIG91dHB1dCA9ICcnLCBpID0gMCwgbCA9IGlucHV0Lmxlbmd0aCwga2V5ID0gJ0FCQ0RFRkdISUpLTE1OT1BRUlNUVVZXWFlaYWJjZGVmZ2hpamtsbW5vcHFyc3R1dnd4eXowMTIzNDU2Nzg5Ky89JywgY2hyMSwgY2hyMiwgY2hyMywgZW5jMSwgZW5jMiwgZW5jMywgZW5jNDtcbiAgICAgICAgd2hpbGUgKGkgPCBsKSB7XG4gICAgICAgICAgY2hyMSA9IGlucHV0LmNoYXJDb2RlQXQoaSsrKTtcbiAgICAgICAgICBjaHIyID0gaW5wdXQuY2hhckNvZGVBdChpKyspO1xuICAgICAgICAgIGNocjMgPSBpbnB1dC5jaGFyQ29kZUF0KGkrKyk7XG4gICAgICAgICAgZW5jMSA9IGNocjEgPj4gMjtcbiAgICAgICAgICBlbmMyID0gKGNocjEgJiAzKSA8PCA0IHwgY2hyMiA+PiA0O1xuICAgICAgICAgIGVuYzMgPSAoY2hyMiAmIDE1KSA8PCAyIHwgY2hyMyA+PiA2O1xuICAgICAgICAgIGVuYzQgPSBjaHIzICYgNjM7XG4gICAgICAgICAgaWYgKGlzTmFOKGNocjIpKVxuICAgICAgICAgICAgZW5jMyA9IGVuYzQgPSA2NDtcbiAgICAgICAgICBlbHNlIGlmIChpc05hTihjaHIzKSlcbiAgICAgICAgICAgIGVuYzQgPSA2NDtcbiAgICAgICAgICBvdXRwdXQgPSBvdXRwdXQgKyBrZXkuY2hhckF0KGVuYzEpICsga2V5LmNoYXJBdChlbmMyKSArIGtleS5jaGFyQXQoZW5jMykgKyBrZXkuY2hhckF0KGVuYzQpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBvdXRwdXQ7XG4gICAgICB9O1xuICAgICAgcmV0dXJuIGJ0b2EgPyBidG9hLmJpbmQod2luZG93KSA6IGZ1bmN0aW9uICgpIHtcbiAgICAgIH07XG4gICAgfSgpLFxuICAgICdpc09iamVjdCc6IGZ1bmN0aW9uIChvYmopIHtcbiAgICAgIHJldHVybiBvYmogJiYgT2JqZWN0LnByb3RvdHlwZS50b1N0cmluZy5jYWxsKG9iaikgPT09ICdbb2JqZWN0IE9iamVjdF0nO1xuICAgIH0sXG4gICAgJ2lzRW1wdHlPYmplY3QnOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICByZXR1cm4gdXRpbHMuaXNPYmplY3Qob2JqKSAmJiAhT2JqZWN0LmtleXMob2JqKS5sZW5ndGg7XG4gICAgfSxcbiAgICAnaXNBcnJheSc6IGZ1bmN0aW9uIChhcnIpIHtcbiAgICAgIHJldHVybiBhcnIgJiYgQXJyYXkuaXNBcnJheShhcnIpO1xuICAgIH0sXG4gICAgJ2lzRnVuY3Rpb24nOiBmdW5jdGlvbiAoZnVuYykge1xuICAgICAgcmV0dXJuIGZ1bmMgJiYgdHlwZW9mIGZ1bmMgPT09ICdmdW5jdGlvbic7XG4gICAgfSxcbiAgICAnaXNFbGVtZW50JzogZnVuY3Rpb24gKGVsZW0pIHtcbiAgICAgIHJldHVybiBlbGVtICYmIGVsZW0ubm9kZVR5cGUgPT09IDE7XG4gICAgfSxcbiAgICAnaXNTdHJpbmcnOiBmdW5jdGlvbiAodmFsdWUpIHtcbiAgICAgIHJldHVybiB0eXBlb2YgdmFsdWUgPT09ICdzdHJpbmcnIHx8IE9iamVjdC5wcm90b3R5cGUudG9TdHJpbmcuY2FsbCh2YWx1ZSkgPT09ICdbb2JqZWN0IFN0cmluZ10nO1xuICAgIH0sXG4gICAgJ2lzU3VwcG9ydGVkJzoge1xuICAgICAgJ2NhbnZhcyc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgdmFyIGVsID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnY2FudmFzJyk7XG4gICAgICAgIHJldHVybiBlbCAmJiBlbC5nZXRDb250ZXh0ICYmIGVsLmdldENvbnRleHQoJzJkJyk7XG4gICAgICB9LFxuICAgICAgJ3dlYndvcmtlcnMnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHJldHVybiB3aW5kb3cuV29ya2VyO1xuICAgICAgfSxcbiAgICAgICdibG9iJzogZnVuY3Rpb24gKCkge1xuICAgICAgICByZXR1cm4gdXRpbHMuQmxvYjtcbiAgICAgIH0sXG4gICAgICAnVWludDhBcnJheSc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5VaW50OEFycmF5O1xuICAgICAgfSxcbiAgICAgICdVaW50MzJBcnJheSc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgcmV0dXJuIHdpbmRvdy5VaW50MzJBcnJheTtcbiAgICAgIH0sXG4gICAgICAndmlkZW9Db2RlY3MnOiBmdW5jdGlvbiAoKSB7XG4gICAgICAgIHZhciB0ZXN0RWwgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd2aWRlbycpLCBzdXBwb3J0T2JqID0ge1xuICAgICAgICAgICAgJ21wNCc6IGZhbHNlLFxuICAgICAgICAgICAgJ2gyNjQnOiBmYWxzZSxcbiAgICAgICAgICAgICdvZ3YnOiBmYWxzZSxcbiAgICAgICAgICAgICdvZ2cnOiBmYWxzZSxcbiAgICAgICAgICAgICd3ZWJtJzogZmFsc2VcbiAgICAgICAgICB9O1xuICAgICAgICB0cnkge1xuICAgICAgICAgIGlmICh0ZXN0RWwgJiYgdGVzdEVsLmNhblBsYXlUeXBlKSB7XG4gICAgICAgICAgICBzdXBwb3J0T2JqLm1wNCA9IHRlc3RFbC5jYW5QbGF5VHlwZSgndmlkZW8vbXA0OyBjb2RlY3M9XCJtcDR2LjIwLjhcIicpICE9PSAnJztcbiAgICAgICAgICAgIHN1cHBvcnRPYmouaDI2NCA9ICh0ZXN0RWwuY2FuUGxheVR5cGUoJ3ZpZGVvL21wNDsgY29kZWNzPVwiYXZjMS40MkUwMUVcIicpIHx8IHRlc3RFbC5jYW5QbGF5VHlwZSgndmlkZW8vbXA0OyBjb2RlY3M9XCJhdmMxLjQyRTAxRSwgbXA0YS40MC4yXCInKSkgIT09ICcnO1xuICAgICAgICAgICAgc3VwcG9ydE9iai5vZ3YgPSB0ZXN0RWwuY2FuUGxheVR5cGUoJ3ZpZGVvL29nZzsgY29kZWNzPVwidGhlb3JhXCInKSAhPT0gJyc7XG4gICAgICAgICAgICBzdXBwb3J0T2JqLm9nZyA9IHRlc3RFbC5jYW5QbGF5VHlwZSgndmlkZW8vb2dnOyBjb2RlY3M9XCJ0aGVvcmFcIicpICE9PSAnJztcbiAgICAgICAgICAgIHN1cHBvcnRPYmoud2VibSA9IHRlc3RFbC5jYW5QbGF5VHlwZSgndmlkZW8vd2VibTsgY29kZWNzPVwidnA4LCB2b3JiaXNcIicpICE9PSAtMTtcbiAgICAgICAgICB9XG4gICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gc3VwcG9ydE9iajtcbiAgICAgIH0oKVxuICAgIH0sXG4gICAgJ25vb3AnOiBmdW5jdGlvbiAoKSB7XG4gICAgfSxcbiAgICAnZWFjaCc6IGZ1bmN0aW9uIChjb2xsZWN0aW9uLCBjYWxsYmFjaykge1xuICAgICAgdmFyIHgsIGxlbjtcbiAgICAgIGlmICh1dGlscy5pc0FycmF5KGNvbGxlY3Rpb24pKSB7XG4gICAgICAgIHggPSAtMTtcbiAgICAgICAgbGVuID0gY29sbGVjdGlvbi5sZW5ndGg7XG4gICAgICAgIHdoaWxlICgrK3ggPCBsZW4pIHtcbiAgICAgICAgICBpZiAoY2FsbGJhY2soeCwgY29sbGVjdGlvblt4XSkgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0gZWxzZSBpZiAodXRpbHMuaXNPYmplY3QoY29sbGVjdGlvbikpIHtcbiAgICAgICAgZm9yICh4IGluIGNvbGxlY3Rpb24pIHtcbiAgICAgICAgICBpZiAoY29sbGVjdGlvbi5oYXNPd25Qcm9wZXJ0eSh4KSkge1xuICAgICAgICAgICAgaWYgKGNhbGxiYWNrKHgsIGNvbGxlY3Rpb25beF0pID09PSBmYWxzZSkge1xuICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LFxuICAgICdtZXJnZU9wdGlvbnMnOiBmdW5jdGlvbiBkZWVwTWVyZ2UoZGVmYXVsdE9wdGlvbnMsIHVzZXJPcHRpb25zKSB7XG4gICAgICBpZiAoIXV0aWxzLmlzT2JqZWN0KGRlZmF1bHRPcHRpb25zKSB8fCAhdXRpbHMuaXNPYmplY3QodXNlck9wdGlvbnMpIHx8ICFPYmplY3Qua2V5cykge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICB2YXIgbmV3T2JqID0ge307XG4gICAgICB1dGlscy5lYWNoKGRlZmF1bHRPcHRpb25zLCBmdW5jdGlvbiAoa2V5LCB2YWwpIHtcbiAgICAgICAgbmV3T2JqW2tleV0gPSBkZWZhdWx0T3B0aW9uc1trZXldO1xuICAgICAgfSk7XG4gICAgICB1dGlscy5lYWNoKHVzZXJPcHRpb25zLCBmdW5jdGlvbiAoa2V5LCB2YWwpIHtcbiAgICAgICAgdmFyIGN1cnJlbnRVc2VyT3B0aW9uID0gdXNlck9wdGlvbnNba2V5XTtcbiAgICAgICAgaWYgKCF1dGlscy5pc09iamVjdChjdXJyZW50VXNlck9wdGlvbikpIHtcbiAgICAgICAgICBuZXdPYmpba2V5XSA9IGN1cnJlbnRVc2VyT3B0aW9uO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgIGlmICghZGVmYXVsdE9wdGlvbnNba2V5XSkge1xuICAgICAgICAgICAgbmV3T2JqW2tleV0gPSBjdXJyZW50VXNlck9wdGlvbjtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgbmV3T2JqW2tleV0gPSBkZWVwTWVyZ2UoZGVmYXVsdE9wdGlvbnNba2V5XSwgY3VycmVudFVzZXJPcHRpb24pO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfSk7XG4gICAgICByZXR1cm4gbmV3T2JqO1xuICAgIH0sXG4gICAgJ3NldENTU0F0dHInOiBmdW5jdGlvbiAoZWxlbSwgYXR0ciwgdmFsKSB7XG4gICAgICBpZiAoIXV0aWxzLmlzRWxlbWVudChlbGVtKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAodXRpbHMuaXNTdHJpbmcoYXR0cikgJiYgdXRpbHMuaXNTdHJpbmcodmFsKSkge1xuICAgICAgICBlbGVtLnN0eWxlW2F0dHJdID0gdmFsO1xuICAgICAgfSBlbHNlIGlmICh1dGlscy5pc09iamVjdChhdHRyKSkge1xuICAgICAgICB1dGlscy5lYWNoKGF0dHIsIGZ1bmN0aW9uIChrZXksIHZhbCkge1xuICAgICAgICAgIGVsZW0uc3R5bGVba2V5XSA9IHZhbDtcbiAgICAgICAgfSk7XG4gICAgICB9XG4gICAgfSxcbiAgICAncmVtb3ZlRWxlbWVudCc6IGZ1bmN0aW9uIChub2RlKSB7XG4gICAgICBpZiAoIXV0aWxzLmlzRWxlbWVudChub2RlKSkge1xuICAgICAgICByZXR1cm47XG4gICAgICB9XG4gICAgICBpZiAobm9kZS5wYXJlbnROb2RlKSB7XG4gICAgICAgIG5vZGUucGFyZW50Tm9kZS5yZW1vdmVDaGlsZChub2RlKTtcbiAgICAgIH1cbiAgICB9LFxuICAgICdjcmVhdGVXZWJXb3JrZXInOiBmdW5jdGlvbiAoY29udGVudCkge1xuICAgICAgaWYgKCF1dGlscy5pc1N0cmluZyhjb250ZW50KSkge1xuICAgICAgICByZXR1cm4ge307XG4gICAgICB9XG4gICAgICB0cnkge1xuICAgICAgICB2YXIgYmxvYiA9IG5ldyB1dGlscy5CbG9iKFtjb250ZW50XSwgeyAndHlwZSc6ICd0ZXh0L2phdmFzY3JpcHQnIH0pLCBvYmplY3RVcmwgPSB1dGlscy5VUkwuY3JlYXRlT2JqZWN0VVJMKGJsb2IpLCB3b3JrZXIgPSBuZXcgV29ya2VyKG9iamVjdFVybCk7XG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgJ29iamVjdFVybCc6IG9iamVjdFVybCxcbiAgICAgICAgICAnd29ya2VyJzogd29ya2VyXG4gICAgICAgIH07XG4gICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgIHJldHVybiAnJyArIGU7XG4gICAgICB9XG4gICAgfSxcbiAgICAnZ2V0RXh0ZW5zaW9uJzogZnVuY3Rpb24gKHNyYykge1xuICAgICAgcmV0dXJuIHNyYy5zdWJzdHIoc3JjLmxhc3RJbmRleE9mKCcuJykgKyAxLCBzcmMubGVuZ3RoKTtcbiAgICB9LFxuICAgICdnZXRGb250U2l6ZSc6IGZ1bmN0aW9uIChvcHRpb25zKSB7XG4gICAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICAgIGlmICghZG9jdW1lbnQuYm9keSB8fCBvcHRpb25zLnJlc2l6ZUZvbnQgPT09IGZhbHNlKSB7XG4gICAgICAgIHJldHVybiBvcHRpb25zLmZvbnRTaXplO1xuICAgICAgfVxuICAgICAgdmFyIHRleHQgPSBvcHRpb25zLnRleHQsIGNvbnRhaW5lcldpZHRoID0gb3B0aW9ucy5naWZXaWR0aCwgZm9udFNpemUgPSBwYXJzZUludChvcHRpb25zLmZvbnRTaXplLCAxMCksIG1pbkZvbnRTaXplID0gcGFyc2VJbnQob3B0aW9ucy5taW5Gb250U2l6ZSwgMTApLCBkaXYgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdkaXYnKSwgc3BhbiA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ3NwYW4nKTtcbiAgICAgIGRpdi5zZXRBdHRyaWJ1dGUoJ3dpZHRoJywgY29udGFpbmVyV2lkdGgpO1xuICAgICAgZGl2LmFwcGVuZENoaWxkKHNwYW4pO1xuICAgICAgc3Bhbi5pbm5lckhUTUwgPSB0ZXh0O1xuICAgICAgc3Bhbi5zdHlsZS5mb250U2l6ZSA9IGZvbnRTaXplICsgJ3B4JztcbiAgICAgIHNwYW4uc3R5bGUudGV4dEluZGVudCA9ICctOTk5OXB4JztcbiAgICAgIHNwYW4uc3R5bGUudmlzaWJpbGl0eSA9ICdoaWRkZW4nO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChzcGFuKTtcbiAgICAgIHdoaWxlIChzcGFuLm9mZnNldFdpZHRoID4gY29udGFpbmVyV2lkdGggJiYgZm9udFNpemUgPj0gbWluRm9udFNpemUpIHtcbiAgICAgICAgc3Bhbi5zdHlsZS5mb250U2l6ZSA9IC0tZm9udFNpemUgKyAncHgnO1xuICAgICAgfVxuICAgICAgZG9jdW1lbnQuYm9keS5yZW1vdmVDaGlsZChzcGFuKTtcbiAgICAgIHJldHVybiBmb250U2l6ZSArICdweCc7XG4gICAgfSxcbiAgICAnd2ViV29ya2VyRXJyb3InOiBmYWxzZVxuICB9O1xuICByZXR1cm4gdXRpbHM7XG59KCk7XG5lcnJvciA9IGZ1bmN0aW9uICh1dGlscykge1xuICB2YXIgZXJyb3IgPSB7XG4gICAgJ3ZhbGlkYXRlJzogZnVuY3Rpb24gKHNraXBPYmopIHtcbiAgICAgIHNraXBPYmogPSB1dGlscy5pc09iamVjdChza2lwT2JqKSA/IHNraXBPYmogOiB7fTtcbiAgICAgIHZhciBlcnJvck9iaiA9IHt9O1xuICAgICAgdXRpbHMuZWFjaChlcnJvci52YWxpZGF0b3JzLCBmdW5jdGlvbiAoaW5kZWNlLCBjdXJyZW50VmFsaWRhdG9yKSB7XG4gICAgICAgIHZhciBlcnJvckNvZGUgPSBjdXJyZW50VmFsaWRhdG9yLmVycm9yQ29kZTtcbiAgICAgICAgaWYgKCFza2lwT2JqW2Vycm9yQ29kZV0gJiYgIWN1cnJlbnRWYWxpZGF0b3IuY29uZGl0aW9uKSB7XG4gICAgICAgICAgZXJyb3JPYmogPSBjdXJyZW50VmFsaWRhdG9yO1xuICAgICAgICAgIGVycm9yT2JqLmVycm9yID0gdHJ1ZTtcbiAgICAgICAgICByZXR1cm4gZmFsc2U7XG4gICAgICAgIH1cbiAgICAgIH0pO1xuICAgICAgZGVsZXRlIGVycm9yT2JqLmNvbmRpdGlvbjtcbiAgICAgIHJldHVybiBlcnJvck9iajtcbiAgICB9LFxuICAgICdpc1ZhbGlkJzogZnVuY3Rpb24gKHNraXBPYmopIHtcbiAgICAgIHZhciBlcnJvck9iaiA9IGVycm9yLnZhbGlkYXRlKHNraXBPYmopLCBpc1ZhbGlkID0gZXJyb3JPYmouZXJyb3IgIT09IHRydWUgPyB0cnVlIDogZmFsc2U7XG4gICAgICByZXR1cm4gaXNWYWxpZDtcbiAgICB9LFxuICAgICd2YWxpZGF0b3JzJzogW1xuICAgICAge1xuICAgICAgICAnY29uZGl0aW9uJzogdXRpbHMuaXNGdW5jdGlvbih1dGlscy5nZXRVc2VyTWVkaWEpLFxuICAgICAgICAnZXJyb3JDb2RlJzogJ2dldFVzZXJNZWRpYScsXG4gICAgICAgICdlcnJvck1zZyc6ICdUaGUgZ2V0VXNlck1lZGlhIEFQSSBpcyBub3Qgc3VwcG9ydGVkIGluIHlvdXIgYnJvd3NlcidcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgICdjb25kaXRpb24nOiB1dGlscy5pc1N1cHBvcnRlZC5jYW52YXMoKSxcbiAgICAgICAgJ2Vycm9yQ29kZSc6ICdjYW52YXMnLFxuICAgICAgICAnZXJyb3JNc2cnOiAnQ2FudmFzIGVsZW1lbnRzIGFyZSBub3Qgc3VwcG9ydGVkIGluIHlvdXIgYnJvd3NlcidcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgICdjb25kaXRpb24nOiB1dGlscy5pc1N1cHBvcnRlZC53ZWJ3b3JrZXJzKCksXG4gICAgICAgICdlcnJvckNvZGUnOiAnd2Vid29ya2VycycsXG4gICAgICAgICdlcnJvck1zZyc6ICdUaGUgV2ViIFdvcmtlcnMgQVBJIGlzIG5vdCBzdXBwb3J0ZWQgaW4geW91ciBicm93c2VyJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgJ2NvbmRpdGlvbic6IHV0aWxzLmlzRnVuY3Rpb24odXRpbHMuVVJMKSxcbiAgICAgICAgJ2Vycm9yQ29kZSc6ICd3aW5kb3cuVVJMJyxcbiAgICAgICAgJ2Vycm9yTXNnJzogJ1RoZSB3aW5kb3cuVVJMIEFQSSBpcyBub3Qgc3VwcG9ydGVkIGluIHlvdXIgYnJvd3NlcidcbiAgICAgIH0sXG4gICAgICB7XG4gICAgICAgICdjb25kaXRpb24nOiB1dGlscy5pc1N1cHBvcnRlZC5ibG9iKCksXG4gICAgICAgICdlcnJvckNvZGUnOiAnd2luZG93LkJsb2InLFxuICAgICAgICAnZXJyb3JNc2cnOiAnVGhlIHdpbmRvdy5CbG9iIEZpbGUgQVBJIGlzIG5vdCBzdXBwb3J0ZWQgaW4geW91ciBicm93c2VyJ1xuICAgICAgfSxcbiAgICAgIHtcbiAgICAgICAgJ2NvbmRpdGlvbic6IHV0aWxzLmlzU3VwcG9ydGVkLlVpbnQ4QXJyYXkoKSxcbiAgICAgICAgJ2Vycm9yQ29kZSc6ICd3aW5kb3cuVWludDhBcnJheScsXG4gICAgICAgICdlcnJvck1zZyc6ICdUaGUgd2luZG93LlVpbnQ4QXJyYXkgZnVuY3Rpb24gY29uc3RydWN0b3IgaXMgbm90IHN1cHBvcnRlZCBpbiB5b3VyIGJyb3dzZXInXG4gICAgICB9LFxuICAgICAge1xuICAgICAgICAnY29uZGl0aW9uJzogdXRpbHMuaXNTdXBwb3J0ZWQuVWludDMyQXJyYXkoKSxcbiAgICAgICAgJ2Vycm9yQ29kZSc6ICd3aW5kb3cuVWludDMyQXJyYXknLFxuICAgICAgICAnZXJyb3JNc2cnOiAnVGhlIHdpbmRvdy5VaW50MzJBcnJheSBmdW5jdGlvbiBjb25zdHJ1Y3RvciBpcyBub3Qgc3VwcG9ydGVkIGluIHlvdXIgYnJvd3NlcidcbiAgICAgIH1cbiAgICBdLFxuICAgICdtZXNzYWdlcyc6IHtcbiAgICAgICd2aWRlb0NvZGVjcyc6IHtcbiAgICAgICAgJ2Vycm9yQ29kZSc6ICd2aWRlb2NvZGVjJyxcbiAgICAgICAgJ2Vycm9yTXNnJzogJ1RoZSB2aWRlbyBjb2RlYyB5b3UgYXJlIHRyeWluZyB0byB1c2UgaXMgbm90IHN1cHBvcnRlZCBpbiB5b3VyIGJyb3dzZXInXG4gICAgICB9XG4gICAgfVxuICB9O1xuICByZXR1cm4gZXJyb3I7XG59KHV0aWxzKTtcbmRlZmF1bHRPcHRpb25zID0ge1xuICAnc2FtcGxlSW50ZXJ2YWwnOiAxMCxcbiAgJ251bVdvcmtlcnMnOiAyLFxuICAnZ2lmV2lkdGgnOiAyMDAsXG4gICdnaWZIZWlnaHQnOiAyMDAsXG4gICdpbnRlcnZhbCc6IDAuMSxcbiAgJ251bUZyYW1lcyc6IDEwLFxuICAna2VlcENhbWVyYU9uJzogZmFsc2UsXG4gICdpbWFnZXMnOiBbXSxcbiAgJ3ZpZGVvJzogbnVsbCxcbiAgJ3dlYmNhbVZpZGVvRWxlbWVudCc6IG51bGwsXG4gICdjYW1lcmFTdHJlYW0nOiBudWxsLFxuICAndGV4dCc6ICcnLFxuICAnZm9udFdlaWdodCc6ICdub3JtYWwnLFxuICAnZm9udFNpemUnOiAnMTZweCcsXG4gICdtaW5Gb250U2l6ZSc6ICcxMHB4JyxcbiAgJ3Jlc2l6ZUZvbnQnOiBmYWxzZSxcbiAgJ2ZvbnRGYW1pbHknOiAnc2Fucy1zZXJpZicsXG4gICdmb250Q29sb3InOiAnI2ZmZmZmZicsXG4gICd0ZXh0QWxpZ24nOiAnY2VudGVyJyxcbiAgJ3RleHRCYXNlbGluZSc6ICdib3R0b20nLFxuICAndGV4dFhDb29yZGluYXRlJzogbnVsbCxcbiAgJ3RleHRZQ29vcmRpbmF0ZSc6IG51bGwsXG4gICdwcm9ncmVzc0NhbGxiYWNrJzogZnVuY3Rpb24gKGNhcHR1cmVQcm9ncmVzcykge1xuICB9LFxuICAnY29tcGxldGVDYWxsYmFjayc6IGZ1bmN0aW9uICgpIHtcbiAgfSxcbiAgJ3NhdmVSZW5kZXJpbmdDb250ZXh0cyc6IGZhbHNlLFxuICAnc2F2ZWRSZW5kZXJpbmdDb250ZXh0cyc6IFtdLFxuICAnY3Jvc3NPcmlnaW4nOiAnQW5vbnltb3VzJ1xufTtcbmlzU3VwcG9ydGVkID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZXJyb3IuaXNWYWxpZCgpO1xufTtcbmlzV2ViQ2FtR0lGU3VwcG9ydGVkID0gZnVuY3Rpb24gKCkge1xuICByZXR1cm4gZXJyb3IuaXNWYWxpZCgpO1xufTtcbmlzRXhpc3RpbmdJbWFnZXNHSUZTdXBwb3J0ZWQgPSBmdW5jdGlvbiAoKSB7XG4gIHZhciBza2lwT2JqID0geyAnZ2V0VXNlck1lZGlhJzogdHJ1ZSB9O1xuICByZXR1cm4gZXJyb3IuaXNWYWxpZChza2lwT2JqKTtcbn07XG5pc0V4aXN0aW5nVmlkZW9HSUZTdXBwb3J0ZWQgPSBmdW5jdGlvbiAoY29kZWNzKSB7XG4gIHZhciBpc1N1cHBvcnRlZCA9IGZhbHNlLCBoYXNWYWxpZENvZGVjID0gZmFsc2U7XG4gIGlmICh1dGlscy5pc0FycmF5KGNvZGVjcykgJiYgY29kZWNzLmxlbmd0aCkge1xuICAgIHV0aWxzLmVhY2goY29kZWNzLCBmdW5jdGlvbiAoaW5kZWNlLCBjdXJyZW50Q29kZWMpIHtcbiAgICAgIGlmICh1dGlscy5pc1N1cHBvcnRlZC52aWRlb0NvZGVjc1tjdXJyZW50Q29kZWNdKSB7XG4gICAgICAgIGhhc1ZhbGlkQ29kZWMgPSB0cnVlO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGlmICghaGFzVmFsaWRDb2RlYykge1xuICAgICAgcmV0dXJuIGZhbHNlO1xuICAgIH1cbiAgfSBlbHNlIGlmICh1dGlscy5pc1N0cmluZyhjb2RlY3MpICYmIGNvZGVjcy5sZW5ndGgpIHtcbiAgICBpZiAoIXV0aWxzLmlzU3VwcG9ydGVkLnZpZGVvQ29kZWNzW2NvZGVjc10pIHtcbiAgICAgIHJldHVybiBmYWxzZTtcbiAgICB9XG4gIH1cbiAgcmV0dXJuIGVycm9yLmlzVmFsaWQoeyAnZ2V0VXNlck1lZGlhJzogdHJ1ZSB9KTtcbn07XG5OZXVRdWFudCA9IGZ1bmN0aW9uICgpIHtcbiAgZnVuY3Rpb24gTmV1UXVhbnQoKSB7XG4gICAgdmFyIG5ldHNpemUgPSAyNTY7XG4gICAgdmFyIHByaW1lMSA9IDQ5OTtcbiAgICB2YXIgcHJpbWUyID0gNDkxO1xuICAgIHZhciBwcmltZTMgPSA0ODc7XG4gICAgdmFyIHByaW1lNCA9IDUwMztcbiAgICB2YXIgbWlucGljdHVyZWJ5dGVzID0gMyAqIHByaW1lNDtcbiAgICB2YXIgbWF4bmV0cG9zID0gbmV0c2l6ZSAtIDE7XG4gICAgdmFyIG5ldGJpYXNzaGlmdCA9IDQ7XG4gICAgdmFyIG5jeWNsZXMgPSAxMDA7XG4gICAgdmFyIGludGJpYXNzaGlmdCA9IDE2O1xuICAgIHZhciBpbnRiaWFzID0gMSA8PCBpbnRiaWFzc2hpZnQ7XG4gICAgdmFyIGdhbW1hc2hpZnQgPSAxMDtcbiAgICB2YXIgZ2FtbWEgPSAxIDw8IGdhbW1hc2hpZnQ7XG4gICAgdmFyIGJldGFzaGlmdCA9IDEwO1xuICAgIHZhciBiZXRhID0gaW50YmlhcyA+PiBiZXRhc2hpZnQ7XG4gICAgdmFyIGJldGFnYW1tYSA9IGludGJpYXMgPDwgZ2FtbWFzaGlmdCAtIGJldGFzaGlmdDtcbiAgICB2YXIgaW5pdHJhZCA9IG5ldHNpemUgPj4gMztcbiAgICB2YXIgcmFkaXVzYmlhc3NoaWZ0ID0gNjtcbiAgICB2YXIgcmFkaXVzYmlhcyA9IDEgPDwgcmFkaXVzYmlhc3NoaWZ0O1xuICAgIHZhciBpbml0cmFkaXVzID0gaW5pdHJhZCAqIHJhZGl1c2JpYXM7XG4gICAgdmFyIHJhZGl1c2RlYyA9IDMwO1xuICAgIHZhciBhbHBoYWJpYXNzaGlmdCA9IDEwO1xuICAgIHZhciBpbml0YWxwaGEgPSAxIDw8IGFscGhhYmlhc3NoaWZ0O1xuICAgIHZhciBhbHBoYWRlYztcbiAgICB2YXIgcmFkYmlhc3NoaWZ0ID0gODtcbiAgICB2YXIgcmFkYmlhcyA9IDEgPDwgcmFkYmlhc3NoaWZ0O1xuICAgIHZhciBhbHBoYXJhZGJzaGlmdCA9IGFscGhhYmlhc3NoaWZ0ICsgcmFkYmlhc3NoaWZ0O1xuICAgIHZhciBhbHBoYXJhZGJpYXMgPSAxIDw8IGFscGhhcmFkYnNoaWZ0O1xuICAgIHZhciB0aGVwaWN0dXJlO1xuICAgIHZhciBsZW5ndGhjb3VudDtcbiAgICB2YXIgc2FtcGxlZmFjO1xuICAgIHZhciBuZXR3b3JrO1xuICAgIHZhciBuZXRpbmRleCA9IFtdO1xuICAgIHZhciBiaWFzID0gW107XG4gICAgdmFyIGZyZXEgPSBbXTtcbiAgICB2YXIgcmFkcG93ZXIgPSBbXTtcbiAgICBmdW5jdGlvbiBOZXVRdWFudENvbnN0cnVjdG9yKHRoZXBpYywgbGVuLCBzYW1wbGUpIHtcbiAgICAgIHZhciBpO1xuICAgICAgdmFyIHA7XG4gICAgICB0aGVwaWN0dXJlID0gdGhlcGljO1xuICAgICAgbGVuZ3RoY291bnQgPSBsZW47XG4gICAgICBzYW1wbGVmYWMgPSBzYW1wbGU7XG4gICAgICBuZXR3b3JrID0gbmV3IEFycmF5KG5ldHNpemUpO1xuICAgICAgZm9yIChpID0gMDsgaSA8IG5ldHNpemU7IGkrKykge1xuICAgICAgICBuZXR3b3JrW2ldID0gbmV3IEFycmF5KDQpO1xuICAgICAgICBwID0gbmV0d29ya1tpXTtcbiAgICAgICAgcFswXSA9IHBbMV0gPSBwWzJdID0gKGkgPDwgbmV0Ymlhc3NoaWZ0ICsgOCkgLyBuZXRzaXplIHwgMDtcbiAgICAgICAgZnJlcVtpXSA9IGludGJpYXMgLyBuZXRzaXplIHwgMDtcbiAgICAgICAgYmlhc1tpXSA9IDA7XG4gICAgICB9XG4gICAgfVxuICAgIGZ1bmN0aW9uIGNvbG9yTWFwKCkge1xuICAgICAgdmFyIG1hcCA9IFtdO1xuICAgICAgdmFyIGluZGV4ID0gbmV3IEFycmF5KG5ldHNpemUpO1xuICAgICAgZm9yICh2YXIgaSA9IDA7IGkgPCBuZXRzaXplOyBpKyspXG4gICAgICAgIGluZGV4W25ldHdvcmtbaV1bM11dID0gaTtcbiAgICAgIHZhciBrID0gMDtcbiAgICAgIGZvciAodmFyIGwgPSAwOyBsIDwgbmV0c2l6ZTsgbCsrKSB7XG4gICAgICAgIHZhciBqID0gaW5kZXhbbF07XG4gICAgICAgIG1hcFtrKytdID0gbmV0d29ya1tqXVswXTtcbiAgICAgICAgbWFwW2srK10gPSBuZXR3b3JrW2pdWzFdO1xuICAgICAgICBtYXBbaysrXSA9IG5ldHdvcmtbal1bMl07XG4gICAgICB9XG4gICAgICByZXR1cm4gbWFwO1xuICAgIH1cbiAgICBmdW5jdGlvbiBpbnhidWlsZCgpIHtcbiAgICAgIHZhciBpO1xuICAgICAgdmFyIGo7XG4gICAgICB2YXIgc21hbGxwb3M7XG4gICAgICB2YXIgc21hbGx2YWw7XG4gICAgICB2YXIgcDtcbiAgICAgIHZhciBxO1xuICAgICAgdmFyIHByZXZpb3VzY29sO1xuICAgICAgdmFyIHN0YXJ0cG9zO1xuICAgICAgcHJldmlvdXNjb2wgPSAwO1xuICAgICAgc3RhcnRwb3MgPSAwO1xuICAgICAgZm9yIChpID0gMDsgaSA8IG5ldHNpemU7IGkrKykge1xuICAgICAgICBwID0gbmV0d29ya1tpXTtcbiAgICAgICAgc21hbGxwb3MgPSBpO1xuICAgICAgICBzbWFsbHZhbCA9IHBbMV07XG4gICAgICAgIGZvciAoaiA9IGkgKyAxOyBqIDwgbmV0c2l6ZTsgaisrKSB7XG4gICAgICAgICAgcSA9IG5ldHdvcmtbal07XG4gICAgICAgICAgaWYgKHFbMV0gPCBzbWFsbHZhbCkge1xuICAgICAgICAgICAgc21hbGxwb3MgPSBqO1xuICAgICAgICAgICAgc21hbGx2YWwgPSBxWzFdO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBxID0gbmV0d29ya1tzbWFsbHBvc107XG4gICAgICAgIGlmIChpICE9IHNtYWxscG9zKSB7XG4gICAgICAgICAgaiA9IHFbMF07XG4gICAgICAgICAgcVswXSA9IHBbMF07XG4gICAgICAgICAgcFswXSA9IGo7XG4gICAgICAgICAgaiA9IHFbMV07XG4gICAgICAgICAgcVsxXSA9IHBbMV07XG4gICAgICAgICAgcFsxXSA9IGo7XG4gICAgICAgICAgaiA9IHFbMl07XG4gICAgICAgICAgcVsyXSA9IHBbMl07XG4gICAgICAgICAgcFsyXSA9IGo7XG4gICAgICAgICAgaiA9IHFbM107XG4gICAgICAgICAgcVszXSA9IHBbM107XG4gICAgICAgICAgcFszXSA9IGo7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKHNtYWxsdmFsICE9IHByZXZpb3VzY29sKSB7XG4gICAgICAgICAgbmV0aW5kZXhbcHJldmlvdXNjb2xdID0gc3RhcnRwb3MgKyBpID4+IDE7XG4gICAgICAgICAgZm9yIChqID0gcHJldmlvdXNjb2wgKyAxOyBqIDwgc21hbGx2YWw7IGorKykge1xuICAgICAgICAgICAgbmV0aW5kZXhbal0gPSBpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBwcmV2aW91c2NvbCA9IHNtYWxsdmFsO1xuICAgICAgICAgIHN0YXJ0cG9zID0gaTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgbmV0aW5kZXhbcHJldmlvdXNjb2xdID0gc3RhcnRwb3MgKyBtYXhuZXRwb3MgPj4gMTtcbiAgICAgIGZvciAoaiA9IHByZXZpb3VzY29sICsgMTsgaiA8IDI1NjsgaisrKSB7XG4gICAgICAgIG5ldGluZGV4W2pdID0gbWF4bmV0cG9zO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBsZWFybigpIHtcbiAgICAgIHZhciBpO1xuICAgICAgdmFyIGo7XG4gICAgICB2YXIgYjtcbiAgICAgIHZhciBnO1xuICAgICAgdmFyIHI7XG4gICAgICB2YXIgcmFkaXVzO1xuICAgICAgdmFyIHJhZDtcbiAgICAgIHZhciBhbHBoYTtcbiAgICAgIHZhciBzdGVwO1xuICAgICAgdmFyIGRlbHRhO1xuICAgICAgdmFyIHNhbXBsZXBpeGVscztcbiAgICAgIHZhciBwO1xuICAgICAgdmFyIHBpeDtcbiAgICAgIHZhciBsaW07XG4gICAgICBpZiAobGVuZ3RoY291bnQgPCBtaW5waWN0dXJlYnl0ZXMpIHtcbiAgICAgICAgc2FtcGxlZmFjID0gMTtcbiAgICAgIH1cbiAgICAgIGFscGhhZGVjID0gMzAgKyAoc2FtcGxlZmFjIC0gMSkgLyAzO1xuICAgICAgcCA9IHRoZXBpY3R1cmU7XG4gICAgICBwaXggPSAwO1xuICAgICAgbGltID0gbGVuZ3RoY291bnQ7XG4gICAgICBzYW1wbGVwaXhlbHMgPSBsZW5ndGhjb3VudCAvICgzICogc2FtcGxlZmFjKTtcbiAgICAgIGRlbHRhID0gc2FtcGxlcGl4ZWxzIC8gbmN5Y2xlcyB8IDA7XG4gICAgICBhbHBoYSA9IGluaXRhbHBoYTtcbiAgICAgIHJhZGl1cyA9IGluaXRyYWRpdXM7XG4gICAgICByYWQgPSByYWRpdXMgPj4gcmFkaXVzYmlhc3NoaWZ0O1xuICAgICAgaWYgKHJhZCA8PSAxKSB7XG4gICAgICAgIHJhZCA9IDA7XG4gICAgICB9XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgcmFkOyBpKyspIHtcbiAgICAgICAgcmFkcG93ZXJbaV0gPSBhbHBoYSAqICgocmFkICogcmFkIC0gaSAqIGkpICogcmFkYmlhcyAvIChyYWQgKiByYWQpKTtcbiAgICAgIH1cbiAgICAgIGlmIChsZW5ndGhjb3VudCA8IG1pbnBpY3R1cmVieXRlcykge1xuICAgICAgICBzdGVwID0gMztcbiAgICAgIH0gZWxzZSBpZiAobGVuZ3RoY291bnQgJSBwcmltZTEgIT09IDApIHtcbiAgICAgICAgc3RlcCA9IDMgKiBwcmltZTE7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBpZiAobGVuZ3RoY291bnQgJSBwcmltZTIgIT09IDApIHtcbiAgICAgICAgICBzdGVwID0gMyAqIHByaW1lMjtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBpZiAobGVuZ3RoY291bnQgJSBwcmltZTMgIT09IDApIHtcbiAgICAgICAgICAgIHN0ZXAgPSAzICogcHJpbWUzO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBzdGVwID0gMyAqIHByaW1lNDtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGkgPSAwO1xuICAgICAgd2hpbGUgKGkgPCBzYW1wbGVwaXhlbHMpIHtcbiAgICAgICAgYiA9IChwW3BpeCArIDBdICYgMjU1KSA8PCBuZXRiaWFzc2hpZnQ7XG4gICAgICAgIGcgPSAocFtwaXggKyAxXSAmIDI1NSkgPDwgbmV0Ymlhc3NoaWZ0O1xuICAgICAgICByID0gKHBbcGl4ICsgMl0gJiAyNTUpIDw8IG5ldGJpYXNzaGlmdDtcbiAgICAgICAgaiA9IGNvbnRlc3QoYiwgZywgcik7XG4gICAgICAgIGFsdGVyc2luZ2xlKGFscGhhLCBqLCBiLCBnLCByKTtcbiAgICAgICAgaWYgKHJhZCAhPT0gMCkge1xuICAgICAgICAgIGFsdGVybmVpZ2gocmFkLCBqLCBiLCBnLCByKTtcbiAgICAgICAgfVxuICAgICAgICBwaXggKz0gc3RlcDtcbiAgICAgICAgaWYgKHBpeCA+PSBsaW0pIHtcbiAgICAgICAgICBwaXggLT0gbGVuZ3RoY291bnQ7XG4gICAgICAgIH1cbiAgICAgICAgaSsrO1xuICAgICAgICBpZiAoZGVsdGEgPT09IDApIHtcbiAgICAgICAgICBkZWx0YSA9IDE7XG4gICAgICAgIH1cbiAgICAgICAgaWYgKGkgJSBkZWx0YSA9PT0gMCkge1xuICAgICAgICAgIGFscGhhIC09IGFscGhhIC8gYWxwaGFkZWM7XG4gICAgICAgICAgcmFkaXVzIC09IHJhZGl1cyAvIHJhZGl1c2RlYztcbiAgICAgICAgICByYWQgPSByYWRpdXMgPj4gcmFkaXVzYmlhc3NoaWZ0O1xuICAgICAgICAgIGlmIChyYWQgPD0gMSkge1xuICAgICAgICAgICAgcmFkID0gMDtcbiAgICAgICAgICB9XG4gICAgICAgICAgZm9yIChqID0gMDsgaiA8IHJhZDsgaisrKSB7XG4gICAgICAgICAgICByYWRwb3dlcltqXSA9IGFscGhhICogKChyYWQgKiByYWQgLSBqICogaikgKiByYWRiaWFzIC8gKHJhZCAqIHJhZCkpO1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBtYXAoYiwgZywgcikge1xuICAgICAgdmFyIGk7XG4gICAgICB2YXIgajtcbiAgICAgIHZhciBkaXN0O1xuICAgICAgdmFyIGE7XG4gICAgICB2YXIgYmVzdGQ7XG4gICAgICB2YXIgcDtcbiAgICAgIHZhciBiZXN0O1xuICAgICAgYmVzdGQgPSAxMDAwO1xuICAgICAgYmVzdCA9IC0xO1xuICAgICAgaSA9IG5ldGluZGV4W2ddO1xuICAgICAgaiA9IGkgLSAxO1xuICAgICAgd2hpbGUgKGkgPCBuZXRzaXplIHx8IGogPj0gMCkge1xuICAgICAgICBpZiAoaSA8IG5ldHNpemUpIHtcbiAgICAgICAgICBwID0gbmV0d29ya1tpXTtcbiAgICAgICAgICBkaXN0ID0gcFsxXSAtIGc7XG4gICAgICAgICAgaWYgKGRpc3QgPj0gYmVzdGQpIHtcbiAgICAgICAgICAgIGkgPSBuZXRzaXplO1xuICAgICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBpKys7XG4gICAgICAgICAgICBpZiAoZGlzdCA8IDApIHtcbiAgICAgICAgICAgICAgZGlzdCA9IC1kaXN0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgYSA9IHBbMF0gLSBiO1xuICAgICAgICAgICAgaWYgKGEgPCAwKSB7XG4gICAgICAgICAgICAgIGEgPSAtYTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGRpc3QgKz0gYTtcbiAgICAgICAgICAgIGlmIChkaXN0IDwgYmVzdGQpIHtcbiAgICAgICAgICAgICAgYSA9IHBbMl0gLSByO1xuICAgICAgICAgICAgICBpZiAoYSA8IDApIHtcbiAgICAgICAgICAgICAgICBhID0gLWE7XG4gICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgZGlzdCArPSBhO1xuICAgICAgICAgICAgICBpZiAoZGlzdCA8IGJlc3RkKSB7XG4gICAgICAgICAgICAgICAgYmVzdGQgPSBkaXN0O1xuICAgICAgICAgICAgICAgIGJlc3QgPSBwWzNdO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChqID49IDApIHtcbiAgICAgICAgICBwID0gbmV0d29ya1tqXTtcbiAgICAgICAgICBkaXN0ID0gZyAtIHBbMV07XG4gICAgICAgICAgaWYgKGRpc3QgPj0gYmVzdGQpIHtcbiAgICAgICAgICAgIGogPSAtMTtcbiAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgai0tO1xuICAgICAgICAgICAgaWYgKGRpc3QgPCAwKSB7XG4gICAgICAgICAgICAgIGRpc3QgPSAtZGlzdDtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGEgPSBwWzBdIC0gYjtcbiAgICAgICAgICAgIGlmIChhIDwgMCkge1xuICAgICAgICAgICAgICBhID0gLWE7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBkaXN0ICs9IGE7XG4gICAgICAgICAgICBpZiAoZGlzdCA8IGJlc3RkKSB7XG4gICAgICAgICAgICAgIGEgPSBwWzJdIC0gcjtcbiAgICAgICAgICAgICAgaWYgKGEgPCAwKSB7XG4gICAgICAgICAgICAgICAgYSA9IC1hO1xuICAgICAgICAgICAgICB9XG4gICAgICAgICAgICAgIGRpc3QgKz0gYTtcbiAgICAgICAgICAgICAgaWYgKGRpc3QgPCBiZXN0ZCkge1xuICAgICAgICAgICAgICAgIGJlc3RkID0gZGlzdDtcbiAgICAgICAgICAgICAgICBiZXN0ID0gcFszXTtcbiAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgcmV0dXJuIGJlc3Q7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHByb2Nlc3MoKSB7XG4gICAgICBsZWFybigpO1xuICAgICAgdW5iaWFzbmV0KCk7XG4gICAgICBpbnhidWlsZCgpO1xuICAgICAgcmV0dXJuIGNvbG9yTWFwKCk7XG4gICAgfVxuICAgIGZ1bmN0aW9uIHVuYmlhc25ldCgpIHtcbiAgICAgIHZhciBpO1xuICAgICAgdmFyIGo7XG4gICAgICBmb3IgKGkgPSAwOyBpIDwgbmV0c2l6ZTsgaSsrKSB7XG4gICAgICAgIG5ldHdvcmtbaV1bMF0gPj49IG5ldGJpYXNzaGlmdDtcbiAgICAgICAgbmV0d29ya1tpXVsxXSA+Pj0gbmV0Ymlhc3NoaWZ0O1xuICAgICAgICBuZXR3b3JrW2ldWzJdID4+PSBuZXRiaWFzc2hpZnQ7XG4gICAgICAgIG5ldHdvcmtbaV1bM10gPSBpO1xuICAgICAgfVxuICAgIH1cbiAgICBmdW5jdGlvbiBhbHRlcm5laWdoKHJhZCwgaSwgYiwgZywgcikge1xuICAgICAgdmFyIGo7XG4gICAgICB2YXIgaztcbiAgICAgIHZhciBsbztcbiAgICAgIHZhciBoaTtcbiAgICAgIHZhciBhO1xuICAgICAgdmFyIG07XG4gICAgICB2YXIgcDtcbiAgICAgIGxvID0gaSAtIHJhZDtcbiAgICAgIGlmIChsbyA8IC0xKSB7XG4gICAgICAgIGxvID0gLTE7XG4gICAgICB9XG4gICAgICBoaSA9IGkgKyByYWQ7XG4gICAgICBpZiAoaGkgPiBuZXRzaXplKSB7XG4gICAgICAgIGhpID0gbmV0c2l6ZTtcbiAgICAgIH1cbiAgICAgIGogPSBpICsgMTtcbiAgICAgIGsgPSBpIC0gMTtcbiAgICAgIG0gPSAxO1xuICAgICAgd2hpbGUgKGogPCBoaSB8fCBrID4gbG8pIHtcbiAgICAgICAgYSA9IHJhZHBvd2VyW20rK107XG4gICAgICAgIGlmIChqIDwgaGkpIHtcbiAgICAgICAgICBwID0gbmV0d29ya1tqKytdO1xuICAgICAgICAgIHRyeSB7XG4gICAgICAgICAgICBwWzBdIC09IGEgKiAocFswXSAtIGIpIC8gYWxwaGFyYWRiaWFzIHwgMDtcbiAgICAgICAgICAgIHBbMV0gLT0gYSAqIChwWzFdIC0gZykgLyBhbHBoYXJhZGJpYXMgfCAwO1xuICAgICAgICAgICAgcFsyXSAtPSBhICogKHBbMl0gLSByKSAvIGFscGhhcmFkYmlhcyB8IDA7XG4gICAgICAgICAgfSBjYXRjaCAoZSkge1xuICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICBpZiAoayA+IGxvKSB7XG4gICAgICAgICAgcCA9IG5ldHdvcmtbay0tXTtcbiAgICAgICAgICB0cnkge1xuICAgICAgICAgICAgcFswXSAtPSBhICogKHBbMF0gLSBiKSAvIGFscGhhcmFkYmlhcyB8IDA7XG4gICAgICAgICAgICBwWzFdIC09IGEgKiAocFsxXSAtIGcpIC8gYWxwaGFyYWRiaWFzIHwgMDtcbiAgICAgICAgICAgIHBbMl0gLT0gYSAqIChwWzJdIC0gcikgLyBhbHBoYXJhZGJpYXMgfCAwO1xuICAgICAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gYWx0ZXJzaW5nbGUoYWxwaGEsIGksIGIsIGcsIHIpIHtcbiAgICAgIHZhciBuID0gbmV0d29ya1tpXTtcbiAgICAgIHZhciBhbHBoYU11bHQgPSBhbHBoYSAvIGluaXRhbHBoYTtcbiAgICAgIG5bMF0gLT0gYWxwaGFNdWx0ICogKG5bMF0gLSBiKSB8IDA7XG4gICAgICBuWzFdIC09IGFscGhhTXVsdCAqIChuWzFdIC0gZykgfCAwO1xuICAgICAgblsyXSAtPSBhbHBoYU11bHQgKiAoblsyXSAtIHIpIHwgMDtcbiAgICB9XG4gICAgZnVuY3Rpb24gY29udGVzdChiLCBnLCByKSB7XG4gICAgICB2YXIgaTtcbiAgICAgIHZhciBkaXN0O1xuICAgICAgdmFyIGE7XG4gICAgICB2YXIgYmlhc2Rpc3Q7XG4gICAgICB2YXIgYmV0YWZyZXE7XG4gICAgICB2YXIgYmVzdHBvcztcbiAgICAgIHZhciBiZXN0Ymlhc3BvcztcbiAgICAgIHZhciBiZXN0ZDtcbiAgICAgIHZhciBiZXN0Ymlhc2Q7XG4gICAgICB2YXIgbjtcbiAgICAgIGJlc3RkID0gfigxIDw8IDMxKTtcbiAgICAgIGJlc3RiaWFzZCA9IGJlc3RkO1xuICAgICAgYmVzdHBvcyA9IC0xO1xuICAgICAgYmVzdGJpYXNwb3MgPSBiZXN0cG9zO1xuICAgICAgZm9yIChpID0gMDsgaSA8IG5ldHNpemU7IGkrKykge1xuICAgICAgICBuID0gbmV0d29ya1tpXTtcbiAgICAgICAgZGlzdCA9IG5bMF0gLSBiO1xuICAgICAgICBpZiAoZGlzdCA8IDApIHtcbiAgICAgICAgICBkaXN0ID0gLWRpc3Q7XG4gICAgICAgIH1cbiAgICAgICAgYSA9IG5bMV0gLSBnO1xuICAgICAgICBpZiAoYSA8IDApIHtcbiAgICAgICAgICBhID0gLWE7XG4gICAgICAgIH1cbiAgICAgICAgZGlzdCArPSBhO1xuICAgICAgICBhID0gblsyXSAtIHI7XG4gICAgICAgIGlmIChhIDwgMCkge1xuICAgICAgICAgIGEgPSAtYTtcbiAgICAgICAgfVxuICAgICAgICBkaXN0ICs9IGE7XG4gICAgICAgIGlmIChkaXN0IDwgYmVzdGQpIHtcbiAgICAgICAgICBiZXN0ZCA9IGRpc3Q7XG4gICAgICAgICAgYmVzdHBvcyA9IGk7XG4gICAgICAgIH1cbiAgICAgICAgYmlhc2Rpc3QgPSBkaXN0IC0gKGJpYXNbaV0gPj4gaW50Ymlhc3NoaWZ0IC0gbmV0Ymlhc3NoaWZ0KTtcbiAgICAgICAgaWYgKGJpYXNkaXN0IDwgYmVzdGJpYXNkKSB7XG4gICAgICAgICAgYmVzdGJpYXNkID0gYmlhc2Rpc3Q7XG4gICAgICAgICAgYmVzdGJpYXNwb3MgPSBpO1xuICAgICAgICB9XG4gICAgICAgIGJldGFmcmVxID0gZnJlcVtpXSA+PiBiZXRhc2hpZnQ7XG4gICAgICAgIGZyZXFbaV0gLT0gYmV0YWZyZXE7XG4gICAgICAgIGJpYXNbaV0gKz0gYmV0YWZyZXEgPDwgZ2FtbWFzaGlmdDtcbiAgICAgIH1cbiAgICAgIGZyZXFbYmVzdHBvc10gKz0gYmV0YTtcbiAgICAgIGJpYXNbYmVzdHBvc10gLT0gYmV0YWdhbW1hO1xuICAgICAgcmV0dXJuIGJlc3RiaWFzcG9zO1xuICAgIH1cbiAgICBOZXVRdWFudENvbnN0cnVjdG9yLmFwcGx5KHRoaXMsIGFyZ3VtZW50cyk7XG4gICAgdmFyIGV4cG9ydHMgPSB7fTtcbiAgICBleHBvcnRzLm1hcCA9IG1hcDtcbiAgICBleHBvcnRzLnByb2Nlc3MgPSBwcm9jZXNzO1xuICAgIHJldHVybiBleHBvcnRzO1xuICB9XG4gIHJldHVybiBOZXVRdWFudDtcbn0oKTtcbnByb2Nlc3NGcmFtZVdvcmtlciA9IGZ1bmN0aW9uIChOZXVRdWFudCkge1xuICB2YXIgd29ya2VyQ29kZSA9IGZ1bmN0aW9uICgpIHtcbiAgICB0cnkge1xuICAgICAgc2VsZi5vbm1lc3NhZ2UgPSBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgdmFyIGRhdGEgPSBldi5kYXRhIHx8IHt9O1xuICAgICAgICB2YXIgcmVzcG9uc2U7XG4gICAgICAgIGlmIChkYXRhLmdpZnNob3QpIHtcbiAgICAgICAgICByZXNwb25zZSA9IHdvcmtlck1ldGhvZHMucnVuKGRhdGEpO1xuICAgICAgICAgIHBvc3RNZXNzYWdlKHJlc3BvbnNlKTtcbiAgICAgICAgfVxuICAgICAgfTtcbiAgICB9IGNhdGNoIChlKSB7XG4gICAgfVxuICAgIHZhciB3b3JrZXJNZXRob2RzID0ge1xuICAgICAgJ2RhdGFUb1JHQic6IGZ1bmN0aW9uIChkYXRhLCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgICAgIHZhciBpID0gMCwgbGVuZ3RoID0gd2lkdGggKiBoZWlnaHQgKiA0LCByZ2IgPSBbXTtcbiAgICAgICAgd2hpbGUgKGkgPCBsZW5ndGgpIHtcbiAgICAgICAgICByZ2IucHVzaChkYXRhW2krK10pO1xuICAgICAgICAgIHJnYi5wdXNoKGRhdGFbaSsrXSk7XG4gICAgICAgICAgcmdiLnB1c2goZGF0YVtpKytdKTtcbiAgICAgICAgICBpKys7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHJnYjtcbiAgICAgIH0sXG4gICAgICAnY29tcG9uZW50aXplZFBhbGV0dGVUb0FycmF5JzogZnVuY3Rpb24gKHBhbGV0dGVSR0IpIHtcbiAgICAgICAgdmFyIHBhbGV0dGVBcnJheSA9IFtdLCBpLCByLCBnLCBiO1xuICAgICAgICBmb3IgKGkgPSAwOyBpIDwgcGFsZXR0ZVJHQi5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICAgIHIgPSBwYWxldHRlUkdCW2ldO1xuICAgICAgICAgIGcgPSBwYWxldHRlUkdCW2kgKyAxXTtcbiAgICAgICAgICBiID0gcGFsZXR0ZVJHQltpICsgMl07XG4gICAgICAgICAgcGFsZXR0ZUFycmF5LnB1c2gociA8PCAxNiB8IGcgPDwgOCB8IGIpO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiBwYWxldHRlQXJyYXk7XG4gICAgICB9LFxuICAgICAgJ3Byb2Nlc3NGcmFtZVdpdGhRdWFudGl6ZXInOiBmdW5jdGlvbiAoaW1hZ2VEYXRhLCB3aWR0aCwgaGVpZ2h0LCBzYW1wbGVJbnRlcnZhbCkge1xuICAgICAgICB2YXIgcmdiQ29tcG9uZW50cyA9IHRoaXMuZGF0YVRvUkdCKGltYWdlRGF0YSwgd2lkdGgsIGhlaWdodCksIG5xID0gbmV3IE5ldVF1YW50KHJnYkNvbXBvbmVudHMsIHJnYkNvbXBvbmVudHMubGVuZ3RoLCBzYW1wbGVJbnRlcnZhbCksIHBhbGV0dGVSR0IgPSBucS5wcm9jZXNzKCksIHBhbGV0dGVBcnJheSA9IG5ldyBVaW50MzJBcnJheSh0aGlzLmNvbXBvbmVudGl6ZWRQYWxldHRlVG9BcnJheShwYWxldHRlUkdCKSksIG51bWJlclBpeGVscyA9IHdpZHRoICogaGVpZ2h0LCBpbmRleGVkUGl4ZWxzID0gbmV3IFVpbnQ4QXJyYXkobnVtYmVyUGl4ZWxzKSwgayA9IDAsIGksIHIsIGcsIGI7XG4gICAgICAgIGZvciAoaSA9IDA7IGkgPCBudW1iZXJQaXhlbHM7IGkrKykge1xuICAgICAgICAgIHIgPSByZ2JDb21wb25lbnRzW2srK107XG4gICAgICAgICAgZyA9IHJnYkNvbXBvbmVudHNbaysrXTtcbiAgICAgICAgICBiID0gcmdiQ29tcG9uZW50c1trKytdO1xuICAgICAgICAgIGluZGV4ZWRQaXhlbHNbaV0gPSBucS5tYXAociwgZywgYik7XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICBwaXhlbHM6IGluZGV4ZWRQaXhlbHMsXG4gICAgICAgICAgcGFsZXR0ZTogcGFsZXR0ZUFycmF5XG4gICAgICAgIH07XG4gICAgICB9LFxuICAgICAgJ3J1bic6IGZ1bmN0aW9uIChmcmFtZSkge1xuICAgICAgICB2YXIgd2lkdGggPSBmcmFtZS53aWR0aCwgaGVpZ2h0ID0gZnJhbWUuaGVpZ2h0LCBpbWFnZURhdGEgPSBmcmFtZS5kYXRhLCBwYWxldHRlID0gZnJhbWUucGFsZXR0ZSwgc2FtcGxlSW50ZXJ2YWwgPSBmcmFtZS5zYW1wbGVJbnRlcnZhbDtcbiAgICAgICAgcmV0dXJuIHRoaXMucHJvY2Vzc0ZyYW1lV2l0aFF1YW50aXplcihpbWFnZURhdGEsIHdpZHRoLCBoZWlnaHQsIHNhbXBsZUludGVydmFsKTtcbiAgICAgIH1cbiAgICB9O1xuICAgIHJldHVybiB3b3JrZXJNZXRob2RzO1xuICB9O1xuICByZXR1cm4gd29ya2VyQ29kZTtcbn0oTmV1UXVhbnQpO1xuZ2lmV3JpdGVyID0gZnVuY3Rpb24gZ2lmV3JpdGVyKGJ1Ziwgd2lkdGgsIGhlaWdodCwgZ29wdHMpIHtcbiAgdmFyIHAgPSAwO1xuICBnb3B0cyA9IGdvcHRzID09PSB1bmRlZmluZWQgPyB7fSA6IGdvcHRzO1xuICB2YXIgbG9vcF9jb3VudCA9IGdvcHRzLmxvb3AgPT09IHVuZGVmaW5lZCA/IG51bGwgOiBnb3B0cy5sb29wO1xuICB2YXIgZ2xvYmFsX3BhbGV0dGUgPSBnb3B0cy5wYWxldHRlID09PSB1bmRlZmluZWQgPyBudWxsIDogZ29wdHMucGFsZXR0ZTtcbiAgaWYgKHdpZHRoIDw9IDAgfHwgaGVpZ2h0IDw9IDAgfHwgd2lkdGggPiA2NTUzNSB8fCBoZWlnaHQgPiA2NTUzNSlcbiAgICB0aHJvdyAnV2lkdGgvSGVpZ2h0IGludmFsaWQuJztcbiAgZnVuY3Rpb24gY2hlY2tfcGFsZXR0ZV9hbmRfbnVtX2NvbG9ycyhwYWxldHRlKSB7XG4gICAgdmFyIG51bV9jb2xvcnMgPSBwYWxldHRlLmxlbmd0aDtcbiAgICBpZiAobnVtX2NvbG9ycyA8IDIgfHwgbnVtX2NvbG9ycyA+IDI1NiB8fCBudW1fY29sb3JzICYgbnVtX2NvbG9ycyAtIDEpXG4gICAgICB0aHJvdyAnSW52YWxpZCBjb2RlL2NvbG9yIGxlbmd0aCwgbXVzdCBiZSBwb3dlciBvZiAyIGFuZCAyIC4uIDI1Ni4nO1xuICAgIHJldHVybiBudW1fY29sb3JzO1xuICB9XG4gIGJ1ZltwKytdID0gNzE7XG4gIGJ1ZltwKytdID0gNzM7XG4gIGJ1ZltwKytdID0gNzA7XG4gIGJ1ZltwKytdID0gNTY7XG4gIGJ1ZltwKytdID0gNTc7XG4gIGJ1ZltwKytdID0gOTc7XG4gIHZhciBncF9udW1fY29sb3JzX3BvdzIgPSAwO1xuICB2YXIgYmFja2dyb3VuZCA9IDA7XG4gIGJ1ZltwKytdID0gd2lkdGggJiAyNTU7XG4gIGJ1ZltwKytdID0gd2lkdGggPj4gOCAmIDI1NTtcbiAgYnVmW3ArK10gPSBoZWlnaHQgJiAyNTU7XG4gIGJ1ZltwKytdID0gaGVpZ2h0ID4+IDggJiAyNTU7XG4gIGJ1ZltwKytdID0gKGdsb2JhbF9wYWxldHRlICE9PSBudWxsID8gMTI4IDogMCkgfCBncF9udW1fY29sb3JzX3BvdzI7XG4gIGJ1ZltwKytdID0gYmFja2dyb3VuZDtcbiAgYnVmW3ArK10gPSAwO1xuICBpZiAobG9vcF9jb3VudCAhPT0gbnVsbCkge1xuICAgIGlmIChsb29wX2NvdW50IDwgMCB8fCBsb29wX2NvdW50ID4gNjU1MzUpXG4gICAgICB0aHJvdyAnTG9vcCBjb3VudCBpbnZhbGlkLic7XG4gICAgYnVmW3ArK10gPSAzMztcbiAgICBidWZbcCsrXSA9IDI1NTtcbiAgICBidWZbcCsrXSA9IDExO1xuICAgIGJ1ZltwKytdID0gNzg7XG4gICAgYnVmW3ArK10gPSA2OTtcbiAgICBidWZbcCsrXSA9IDg0O1xuICAgIGJ1ZltwKytdID0gODM7XG4gICAgYnVmW3ArK10gPSA2NztcbiAgICBidWZbcCsrXSA9IDY1O1xuICAgIGJ1ZltwKytdID0gODA7XG4gICAgYnVmW3ArK10gPSA2OTtcbiAgICBidWZbcCsrXSA9IDUwO1xuICAgIGJ1ZltwKytdID0gNDY7XG4gICAgYnVmW3ArK10gPSA0ODtcbiAgICBidWZbcCsrXSA9IDM7XG4gICAgYnVmW3ArK10gPSAxO1xuICAgIGJ1ZltwKytdID0gbG9vcF9jb3VudCAmIDI1NTtcbiAgICBidWZbcCsrXSA9IGxvb3BfY291bnQgPj4gOCAmIDI1NTtcbiAgICBidWZbcCsrXSA9IDA7XG4gIH1cbiAgdmFyIGVuZGVkID0gZmFsc2U7XG4gIHRoaXMuYWRkRnJhbWUgPSBmdW5jdGlvbiAoeCwgeSwgdywgaCwgaW5kZXhlZF9waXhlbHMsIG9wdHMpIHtcbiAgICBpZiAoZW5kZWQgPT09IHRydWUpIHtcbiAgICAgIC0tcDtcbiAgICAgIGVuZGVkID0gZmFsc2U7XG4gICAgfVxuICAgIG9wdHMgPSBvcHRzID09PSB1bmRlZmluZWQgPyB7fSA6IG9wdHM7XG4gICAgaWYgKHggPCAwIHx8IHkgPCAwIHx8IHggPiA2NTUzNSB8fCB5ID4gNjU1MzUpXG4gICAgICB0aHJvdyAneC95IGludmFsaWQuJztcbiAgICBpZiAodyA8PSAwIHx8IGggPD0gMCB8fCB3ID4gNjU1MzUgfHwgaCA+IDY1NTM1KVxuICAgICAgdGhyb3cgJ1dpZHRoL0hlaWdodCBpbnZhbGlkLic7XG4gICAgaWYgKGluZGV4ZWRfcGl4ZWxzLmxlbmd0aCA8IHcgKiBoKVxuICAgICAgdGhyb3cgJ05vdCBlbm91Z2ggcGl4ZWxzIGZvciB0aGUgZnJhbWUgc2l6ZS4nO1xuICAgIHZhciB1c2luZ19sb2NhbF9wYWxldHRlID0gdHJ1ZTtcbiAgICB2YXIgcGFsZXR0ZSA9IG9wdHMucGFsZXR0ZTtcbiAgICBpZiAocGFsZXR0ZSA9PT0gdW5kZWZpbmVkIHx8IHBhbGV0dGUgPT09IG51bGwpIHtcbiAgICAgIHVzaW5nX2xvY2FsX3BhbGV0dGUgPSBmYWxzZTtcbiAgICAgIHBhbGV0dGUgPSBnbG9iYWxfcGFsZXR0ZTtcbiAgICB9XG4gICAgaWYgKHBhbGV0dGUgPT09IHVuZGVmaW5lZCB8fCBwYWxldHRlID09PSBudWxsKVxuICAgICAgdGhyb3cgJ011c3Qgc3VwcGx5IGVpdGhlciBhIGxvY2FsIG9yIGdsb2JhbCBwYWxldHRlLic7XG4gICAgdmFyIG51bV9jb2xvcnMgPSBjaGVja19wYWxldHRlX2FuZF9udW1fY29sb3JzKHBhbGV0dGUpO1xuICAgIHZhciBtaW5fY29kZV9zaXplID0gMDtcbiAgICB3aGlsZSAobnVtX2NvbG9ycyA+Pj0gMSlcbiAgICAgICsrbWluX2NvZGVfc2l6ZTtcbiAgICBudW1fY29sb3JzID0gMSA8PCBtaW5fY29kZV9zaXplO1xuICAgIHZhciBkZWxheSA9IG9wdHMuZGVsYXkgPT09IHVuZGVmaW5lZCA/IDAgOiBvcHRzLmRlbGF5O1xuICAgIHZhciBkaXNwb3NhbCA9IG9wdHMuZGlzcG9zYWwgPT09IHVuZGVmaW5lZCA/IDAgOiBvcHRzLmRpc3Bvc2FsO1xuICAgIGlmIChkaXNwb3NhbCA8IDAgfHwgZGlzcG9zYWwgPiAzKVxuICAgICAgdGhyb3cgJ0Rpc3Bvc2FsIG91dCBvZiByYW5nZS4nO1xuICAgIHZhciB1c2VfdHJhbnNwYXJlbmN5ID0gZmFsc2U7XG4gICAgdmFyIHRyYW5zcGFyZW50X2luZGV4ID0gMDtcbiAgICBpZiAob3B0cy50cmFuc3BhcmVudCAhPT0gdW5kZWZpbmVkICYmIG9wdHMudHJhbnNwYXJlbnQgIT09IG51bGwpIHtcbiAgICAgIHVzZV90cmFuc3BhcmVuY3kgPSB0cnVlO1xuICAgICAgdHJhbnNwYXJlbnRfaW5kZXggPSBvcHRzLnRyYW5zcGFyZW50O1xuICAgICAgaWYgKHRyYW5zcGFyZW50X2luZGV4IDwgMCB8fCB0cmFuc3BhcmVudF9pbmRleCA+PSBudW1fY29sb3JzKVxuICAgICAgICB0aHJvdyAnVHJhbnNwYXJlbnQgY29sb3IgaW5kZXguJztcbiAgICB9XG4gICAgaWYgKGRpc3Bvc2FsICE9PSAwIHx8IHVzZV90cmFuc3BhcmVuY3kgfHwgZGVsYXkgIT09IDApIHtcbiAgICAgIGJ1ZltwKytdID0gMzM7XG4gICAgICBidWZbcCsrXSA9IDI0OTtcbiAgICAgIGJ1ZltwKytdID0gNDtcbiAgICAgIGJ1ZltwKytdID0gZGlzcG9zYWwgPDwgMiB8ICh1c2VfdHJhbnNwYXJlbmN5ID09PSB0cnVlID8gMSA6IDApO1xuICAgICAgYnVmW3ArK10gPSBkZWxheSAmIDI1NTtcbiAgICAgIGJ1ZltwKytdID0gZGVsYXkgPj4gOCAmIDI1NTtcbiAgICAgIGJ1ZltwKytdID0gdHJhbnNwYXJlbnRfaW5kZXg7XG4gICAgICBidWZbcCsrXSA9IDA7XG4gICAgfVxuICAgIGJ1ZltwKytdID0gNDQ7XG4gICAgYnVmW3ArK10gPSB4ICYgMjU1O1xuICAgIGJ1ZltwKytdID0geCA+PiA4ICYgMjU1O1xuICAgIGJ1ZltwKytdID0geSAmIDI1NTtcbiAgICBidWZbcCsrXSA9IHkgPj4gOCAmIDI1NTtcbiAgICBidWZbcCsrXSA9IHcgJiAyNTU7XG4gICAgYnVmW3ArK10gPSB3ID4+IDggJiAyNTU7XG4gICAgYnVmW3ArK10gPSBoICYgMjU1O1xuICAgIGJ1ZltwKytdID0gaCA+PiA4ICYgMjU1O1xuICAgIGJ1ZltwKytdID0gdXNpbmdfbG9jYWxfcGFsZXR0ZSA9PT0gdHJ1ZSA/IDEyOCB8IG1pbl9jb2RlX3NpemUgLSAxIDogMDtcbiAgICBpZiAodXNpbmdfbG9jYWxfcGFsZXR0ZSA9PT0gdHJ1ZSkge1xuICAgICAgZm9yICh2YXIgaSA9IDAsIGlsID0gcGFsZXR0ZS5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgICAgIHZhciByZ2IgPSBwYWxldHRlW2ldO1xuICAgICAgICBidWZbcCsrXSA9IHJnYiA+PiAxNiAmIDI1NTtcbiAgICAgICAgYnVmW3ArK10gPSByZ2IgPj4gOCAmIDI1NTtcbiAgICAgICAgYnVmW3ArK10gPSByZ2IgJiAyNTU7XG4gICAgICB9XG4gICAgfVxuICAgIHAgPSBHaWZXcml0ZXJPdXRwdXRMWldDb2RlU3RyZWFtKGJ1ZiwgcCwgbWluX2NvZGVfc2l6ZSA8IDIgPyAyIDogbWluX2NvZGVfc2l6ZSwgaW5kZXhlZF9waXhlbHMpO1xuICB9O1xuICB0aGlzLmVuZCA9IGZ1bmN0aW9uICgpIHtcbiAgICBpZiAoZW5kZWQgPT09IGZhbHNlKSB7XG4gICAgICBidWZbcCsrXSA9IDU5O1xuICAgICAgZW5kZWQgPSB0cnVlO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfTtcbiAgZnVuY3Rpb24gR2lmV3JpdGVyT3V0cHV0TFpXQ29kZVN0cmVhbShidWYsIHAsIG1pbl9jb2RlX3NpemUsIGluZGV4X3N0cmVhbSkge1xuICAgIGJ1ZltwKytdID0gbWluX2NvZGVfc2l6ZTtcbiAgICB2YXIgY3VyX3N1YmJsb2NrID0gcCsrO1xuICAgIHZhciBjbGVhcl9jb2RlID0gMSA8PCBtaW5fY29kZV9zaXplO1xuICAgIHZhciBjb2RlX21hc2sgPSBjbGVhcl9jb2RlIC0gMTtcbiAgICB2YXIgZW9pX2NvZGUgPSBjbGVhcl9jb2RlICsgMTtcbiAgICB2YXIgbmV4dF9jb2RlID0gZW9pX2NvZGUgKyAxO1xuICAgIHZhciBjdXJfY29kZV9zaXplID0gbWluX2NvZGVfc2l6ZSArIDE7XG4gICAgdmFyIGN1cl9zaGlmdCA9IDA7XG4gICAgdmFyIGN1ciA9IDA7XG4gICAgZnVuY3Rpb24gZW1pdF9ieXRlc190b19idWZmZXIoYml0X2Jsb2NrX3NpemUpIHtcbiAgICAgIHdoaWxlIChjdXJfc2hpZnQgPj0gYml0X2Jsb2NrX3NpemUpIHtcbiAgICAgICAgYnVmW3ArK10gPSBjdXIgJiAyNTU7XG4gICAgICAgIGN1ciA+Pj0gODtcbiAgICAgICAgY3VyX3NoaWZ0IC09IDg7XG4gICAgICAgIGlmIChwID09PSBjdXJfc3ViYmxvY2sgKyAyNTYpIHtcbiAgICAgICAgICBidWZbY3VyX3N1YmJsb2NrXSA9IDI1NTtcbiAgICAgICAgICBjdXJfc3ViYmxvY2sgPSBwKys7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9XG4gICAgZnVuY3Rpb24gZW1pdF9jb2RlKGMpIHtcbiAgICAgIGN1ciB8PSBjIDw8IGN1cl9zaGlmdDtcbiAgICAgIGN1cl9zaGlmdCArPSBjdXJfY29kZV9zaXplO1xuICAgICAgZW1pdF9ieXRlc190b19idWZmZXIoOCk7XG4gICAgfVxuICAgIHZhciBpYl9jb2RlID0gaW5kZXhfc3RyZWFtWzBdICYgY29kZV9tYXNrO1xuICAgIHZhciBjb2RlX3RhYmxlID0ge307XG4gICAgZW1pdF9jb2RlKGNsZWFyX2NvZGUpO1xuICAgIGZvciAodmFyIGkgPSAxLCBpbCA9IGluZGV4X3N0cmVhbS5sZW5ndGg7IGkgPCBpbDsgKytpKSB7XG4gICAgICB2YXIgayA9IGluZGV4X3N0cmVhbVtpXSAmIGNvZGVfbWFzaztcbiAgICAgIHZhciBjdXJfa2V5ID0gaWJfY29kZSA8PCA4IHwgaztcbiAgICAgIHZhciBjdXJfY29kZSA9IGNvZGVfdGFibGVbY3VyX2tleV07XG4gICAgICBpZiAoY3VyX2NvZGUgPT09IHVuZGVmaW5lZCkge1xuICAgICAgICBjdXIgfD0gaWJfY29kZSA8PCBjdXJfc2hpZnQ7XG4gICAgICAgIGN1cl9zaGlmdCArPSBjdXJfY29kZV9zaXplO1xuICAgICAgICB3aGlsZSAoY3VyX3NoaWZ0ID49IDgpIHtcbiAgICAgICAgICBidWZbcCsrXSA9IGN1ciAmIDI1NTtcbiAgICAgICAgICBjdXIgPj49IDg7XG4gICAgICAgICAgY3VyX3NoaWZ0IC09IDg7XG4gICAgICAgICAgaWYgKHAgPT09IGN1cl9zdWJibG9jayArIDI1Nikge1xuICAgICAgICAgICAgYnVmW2N1cl9zdWJibG9ja10gPSAyNTU7XG4gICAgICAgICAgICBjdXJfc3ViYmxvY2sgPSBwKys7XG4gICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIGlmIChuZXh0X2NvZGUgPT09IDQwOTYpIHtcbiAgICAgICAgICBlbWl0X2NvZGUoY2xlYXJfY29kZSk7XG4gICAgICAgICAgbmV4dF9jb2RlID0gZW9pX2NvZGUgKyAxO1xuICAgICAgICAgIGN1cl9jb2RlX3NpemUgPSBtaW5fY29kZV9zaXplICsgMTtcbiAgICAgICAgICBjb2RlX3RhYmxlID0ge307XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgaWYgKG5leHRfY29kZSA+PSAxIDw8IGN1cl9jb2RlX3NpemUpXG4gICAgICAgICAgICArK2N1cl9jb2RlX3NpemU7XG4gICAgICAgICAgY29kZV90YWJsZVtjdXJfa2V5XSA9IG5leHRfY29kZSsrO1xuICAgICAgICB9XG4gICAgICAgIGliX2NvZGUgPSBrO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgaWJfY29kZSA9IGN1cl9jb2RlO1xuICAgICAgfVxuICAgIH1cbiAgICBlbWl0X2NvZGUoaWJfY29kZSk7XG4gICAgZW1pdF9jb2RlKGVvaV9jb2RlKTtcbiAgICBlbWl0X2J5dGVzX3RvX2J1ZmZlcigxKTtcbiAgICBpZiAoY3VyX3N1YmJsb2NrICsgMSA9PT0gcCkge1xuICAgICAgYnVmW2N1cl9zdWJibG9ja10gPSAwO1xuICAgIH0gZWxzZSB7XG4gICAgICBidWZbY3VyX3N1YmJsb2NrXSA9IHAgLSBjdXJfc3ViYmxvY2sgLSAxO1xuICAgICAgYnVmW3ArK10gPSAwO1xuICAgIH1cbiAgICByZXR1cm4gcDtcbiAgfVxufTtcbkFuaW1hdGVkR0lGID0gZnVuY3Rpb24gKHV0aWxzLCBmcmFtZVdvcmtlckNvZGUsIE5ldVF1YW50LCBHaWZXcml0ZXIpIHtcbiAgdmFyIEFuaW1hdGVkR0lGID0gZnVuY3Rpb24gKG9wdGlvbnMpIHtcbiAgICB0aGlzLmNhbnZhcyA9IG51bGw7XG4gICAgdGhpcy5jdHggPSBudWxsO1xuICAgIHRoaXMucmVwZWF0ID0gMDtcbiAgICB0aGlzLmZyYW1lcyA9IFtdO1xuICAgIHRoaXMubnVtUmVuZGVyZWRGcmFtZXMgPSAwO1xuICAgIHRoaXMub25SZW5kZXJDb21wbGV0ZUNhbGxiYWNrID0gdXRpbHMubm9vcDtcbiAgICB0aGlzLm9uUmVuZGVyUHJvZ3Jlc3NDYWxsYmFjayA9IHV0aWxzLm5vb3A7XG4gICAgdGhpcy53b3JrZXJzID0gW107XG4gICAgdGhpcy5hdmFpbGFibGVXb3JrZXJzID0gW107XG4gICAgdGhpcy5nZW5lcmF0aW5nR0lGID0gZmFsc2U7XG4gICAgdGhpcy5vcHRpb25zID0gb3B0aW9ucztcbiAgICB0aGlzLmluaXRpYWxpemVXZWJXb3JrZXJzKG9wdGlvbnMpO1xuICB9O1xuICBBbmltYXRlZEdJRi5wcm90b3R5cGUgPSB7XG4gICAgJ3dvcmtlck1ldGhvZHMnOiBmcmFtZVdvcmtlckNvZGUoKSxcbiAgICAnaW5pdGlhbGl6ZVdlYldvcmtlcnMnOiBmdW5jdGlvbiAob3B0aW9ucykge1xuICAgICAgdmFyIHByb2Nlc3NGcmFtZVdvcmtlckNvZGUgPSBOZXVRdWFudC50b1N0cmluZygpICsgJygnICsgZnJhbWVXb3JrZXJDb2RlLnRvU3RyaW5nKCkgKyAnKCkpOycsIHdlYldvcmtlck9iaiwgb2JqZWN0VXJsLCB3ZWJXb3JrZXIsIG51bVdvcmtlcnMsIHggPSAtMSwgd29ya2VyRXJyb3IgPSAnJztcbiAgICAgIG51bVdvcmtlcnMgPSBvcHRpb25zLm51bVdvcmtlcnM7XG4gICAgICB3aGlsZSAoKyt4IDwgbnVtV29ya2Vycykge1xuICAgICAgICB3ZWJXb3JrZXJPYmogPSB1dGlscy5jcmVhdGVXZWJXb3JrZXIocHJvY2Vzc0ZyYW1lV29ya2VyQ29kZSk7XG4gICAgICAgIGlmICh1dGlscy5pc09iamVjdCh3ZWJXb3JrZXJPYmopKSB7XG4gICAgICAgICAgb2JqZWN0VXJsID0gd2ViV29ya2VyT2JqLm9iamVjdFVybDtcbiAgICAgICAgICB3ZWJXb3JrZXIgPSB3ZWJXb3JrZXJPYmoud29ya2VyO1xuICAgICAgICAgIHRoaXMud29ya2Vycy5wdXNoKHtcbiAgICAgICAgICAgICd3b3JrZXInOiB3ZWJXb3JrZXIsXG4gICAgICAgICAgICAnb2JqZWN0VXJsJzogb2JqZWN0VXJsXG4gICAgICAgICAgfSk7XG4gICAgICAgICAgdGhpcy5hdmFpbGFibGVXb3JrZXJzLnB1c2god2ViV29ya2VyKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICB3b3JrZXJFcnJvciA9IHdlYldvcmtlck9iajtcbiAgICAgICAgICB1dGlscy53ZWJXb3JrZXJFcnJvciA9ICEhd2ViV29ya2VyT2JqO1xuICAgICAgICB9XG4gICAgICB9XG4gICAgICB0aGlzLndvcmtlckVycm9yID0gd29ya2VyRXJyb3I7XG4gICAgICB0aGlzLmNhbnZhcyA9IGRvY3VtZW50LmNyZWF0ZUVsZW1lbnQoJ2NhbnZhcycpO1xuICAgICAgdGhpcy5jYW52YXMud2lkdGggPSBvcHRpb25zLmdpZldpZHRoO1xuICAgICAgdGhpcy5jYW52YXMuaGVpZ2h0ID0gb3B0aW9ucy5naWZIZWlnaHQ7XG4gICAgICB0aGlzLmN0eCA9IHRoaXMuY2FudmFzLmdldENvbnRleHQoJzJkJyk7XG4gICAgICB0aGlzLmZyYW1lcyA9IFtdO1xuICAgIH0sXG4gICAgJ2dldFdvcmtlcic6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmF2YWlsYWJsZVdvcmtlcnMucG9wKCk7XG4gICAgfSxcbiAgICAnZnJlZVdvcmtlcic6IGZ1bmN0aW9uICh3b3JrZXIpIHtcbiAgICAgIHRoaXMuYXZhaWxhYmxlV29ya2Vycy5wdXNoKHdvcmtlcik7XG4gICAgfSxcbiAgICAnYnl0ZU1hcCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHZhciBieXRlTWFwID0gW107XG4gICAgICBmb3IgKHZhciBpID0gMDsgaSA8IDI1NjsgaSsrKSB7XG4gICAgICAgIGJ5dGVNYXBbaV0gPSBTdHJpbmcuZnJvbUNoYXJDb2RlKGkpO1xuICAgICAgfVxuICAgICAgcmV0dXJuIGJ5dGVNYXA7XG4gICAgfSgpLFxuICAgICdidWZmZXJUb1N0cmluZyc6IGZ1bmN0aW9uIChidWZmZXIpIHtcbiAgICAgIHZhciBudW1iZXJWYWx1ZXMgPSBidWZmZXIubGVuZ3RoLCBzdHIgPSAnJywgeCA9IC0xO1xuICAgICAgd2hpbGUgKCsreCA8IG51bWJlclZhbHVlcykge1xuICAgICAgICBzdHIgKz0gdGhpcy5ieXRlTWFwW2J1ZmZlclt4XV07XG4gICAgICB9XG4gICAgICByZXR1cm4gc3RyO1xuICAgIH0sXG4gICAgJ29uRnJhbWVGaW5pc2hlZCc6IGZ1bmN0aW9uIChwcm9ncmVzc0NhbGxiYWNrKSB7XG4gICAgICB2YXIgc2VsZiA9IHRoaXMsIGZyYW1lcyA9IHNlbGYuZnJhbWVzLCBvcHRpb25zID0gc2VsZi5vcHRpb25zO1xuICAgICAgaGFzRXhpc3RpbmdJbWFnZXMgPSAhIShvcHRpb25zLmltYWdlcyB8fCBbXSkubGVuZ3RoO1xuICAgICAgYWxsRG9uZSA9IGZyYW1lcy5ldmVyeShmdW5jdGlvbiAoZnJhbWUpIHtcbiAgICAgICAgcmV0dXJuICFmcmFtZS5iZWluZ1Byb2Nlc3NlZCAmJiBmcmFtZS5kb25lO1xuICAgICAgfSk7XG4gICAgICBzZWxmLm51bVJlbmRlcmVkRnJhbWVzKys7XG4gICAgICBpZiAoaGFzRXhpc3RpbmdJbWFnZXMpIHtcbiAgICAgICAgcHJvZ3Jlc3NDYWxsYmFjayhzZWxmLm51bVJlbmRlcmVkRnJhbWVzIC8gZnJhbWVzLmxlbmd0aCk7XG4gICAgICB9XG4gICAgICBzZWxmLm9uUmVuZGVyUHJvZ3Jlc3NDYWxsYmFjayhzZWxmLm51bVJlbmRlcmVkRnJhbWVzICogMC43NSAvIGZyYW1lcy5sZW5ndGgpO1xuICAgICAgaWYgKGFsbERvbmUpIHtcbiAgICAgICAgaWYgKCFzZWxmLmdlbmVyYXRpbmdHSUYpIHtcbiAgICAgICAgICBzZWxmLmdlbmVyYXRlR0lGKGZyYW1lcywgc2VsZi5vblJlbmRlckNvbXBsZXRlQ2FsbGJhY2spO1xuICAgICAgICB9XG4gICAgICB9IGVsc2Uge1xuICAgICAgICB1dGlscy5yZXF1ZXN0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgc2VsZi5wcm9jZXNzTmV4dEZyYW1lKCk7XG4gICAgICAgIH0sIDEpO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ3Byb2Nlc3NGcmFtZSc6IGZ1bmN0aW9uIChwb3NpdGlvbikge1xuICAgICAgdmFyIEFuaW1hdGVkR2lmQ29udGV4dCA9IHRoaXMsIG9wdGlvbnMgPSB0aGlzLm9wdGlvbnMsIHByb2dyZXNzQ2FsbGJhY2sgPSBvcHRpb25zLnByb2dyZXNzQ2FsbGJhY2ssIHNhbXBsZUludGVydmFsID0gb3B0aW9ucy5zYW1wbGVJbnRlcnZhbCwgZnJhbWVzID0gdGhpcy5mcmFtZXMsIGZyYW1lLCB3b3JrZXIsIGRvbmUgPSBmdW5jdGlvbiAoZXYpIHtcbiAgICAgICAgICB2YXIgZGF0YSA9IGV2LmRhdGE7XG4gICAgICAgICAgZGVsZXRlIGZyYW1lLmRhdGE7XG4gICAgICAgICAgZnJhbWUucGl4ZWxzID0gQXJyYXkucHJvdG90eXBlLnNsaWNlLmNhbGwoZGF0YS5waXhlbHMpO1xuICAgICAgICAgIGZyYW1lLnBhbGV0dGUgPSBBcnJheS5wcm90b3R5cGUuc2xpY2UuY2FsbChkYXRhLnBhbGV0dGUpO1xuICAgICAgICAgIGZyYW1lLmRvbmUgPSB0cnVlO1xuICAgICAgICAgIGZyYW1lLmJlaW5nUHJvY2Vzc2VkID0gZmFsc2U7XG4gICAgICAgICAgQW5pbWF0ZWRHaWZDb250ZXh0LmZyZWVXb3JrZXIod29ya2VyKTtcbiAgICAgICAgICBBbmltYXRlZEdpZkNvbnRleHQub25GcmFtZUZpbmlzaGVkKHByb2dyZXNzQ2FsbGJhY2spO1xuICAgICAgICB9O1xuICAgICAgZnJhbWUgPSBmcmFtZXNbcG9zaXRpb25dO1xuICAgICAgaWYgKGZyYW1lLmJlaW5nUHJvY2Vzc2VkIHx8IGZyYW1lLmRvbmUpIHtcbiAgICAgICAgdGhpcy5vbkZyYW1lRmluaXNoZWQoKTtcbiAgICAgICAgcmV0dXJuO1xuICAgICAgfVxuICAgICAgZnJhbWUuc2FtcGxlSW50ZXJ2YWwgPSBzYW1wbGVJbnRlcnZhbDtcbiAgICAgIGZyYW1lLmJlaW5nUHJvY2Vzc2VkID0gdHJ1ZTtcbiAgICAgIGZyYW1lLmdpZnNob3QgPSB0cnVlO1xuICAgICAgd29ya2VyID0gdGhpcy5nZXRXb3JrZXIoKTtcbiAgICAgIGlmICh3b3JrZXIpIHtcbiAgICAgICAgd29ya2VyLm9ubWVzc2FnZSA9IGRvbmU7XG4gICAgICAgIHdvcmtlci5wb3N0TWVzc2FnZShmcmFtZSk7XG4gICAgICB9IGVsc2Uge1xuICAgICAgICBkb25lKHsgJ2RhdGEnOiBBbmltYXRlZEdpZkNvbnRleHQud29ya2VyTWV0aG9kcy5ydW4oZnJhbWUpIH0pO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ3N0YXJ0UmVuZGVyaW5nJzogZnVuY3Rpb24gKGNvbXBsZXRlQ2FsbGJhY2spIHtcbiAgICAgIHRoaXMub25SZW5kZXJDb21wbGV0ZUNhbGxiYWNrID0gY29tcGxldGVDYWxsYmFjaztcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5vcHRpb25zLm51bVdvcmtlcnMgJiYgaSA8IHRoaXMuZnJhbWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0ZyYW1lKGkpO1xuICAgICAgfVxuICAgIH0sXG4gICAgJ3Byb2Nlc3NOZXh0RnJhbWUnOiBmdW5jdGlvbiAoKSB7XG4gICAgICB2YXIgcG9zaXRpb24gPSAtMTtcbiAgICAgIGZvciAodmFyIGkgPSAwOyBpIDwgdGhpcy5mcmFtZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmFyIGZyYW1lID0gdGhpcy5mcmFtZXNbaV07XG4gICAgICAgIGlmICghZnJhbWUuZG9uZSAmJiAhZnJhbWUuYmVpbmdQcm9jZXNzZWQpIHtcbiAgICAgICAgICBwb3NpdGlvbiA9IGk7XG4gICAgICAgICAgYnJlYWs7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICAgIGlmIChwb3NpdGlvbiA+PSAwKSB7XG4gICAgICAgIHRoaXMucHJvY2Vzc0ZyYW1lKHBvc2l0aW9uKTtcbiAgICAgIH1cbiAgICB9LFxuICAgICdnZW5lcmF0ZUdJRic6IGZ1bmN0aW9uIChmcmFtZXMsIGNhbGxiYWNrKSB7XG4gICAgICB2YXIgYnVmZmVyID0gW10sIGdpZk9wdGlvbnMgPSB7ICdsb29wJzogdGhpcy5yZXBlYXQgfSwgb3B0aW9ucyA9IHRoaXMub3B0aW9ucywgaW50ZXJ2YWwgPSBvcHRpb25zLmludGVydmFsLCBleGlzdGluZ0ltYWdlcyA9IG9wdGlvbnMuaW1hZ2VzLCBoYXNFeGlzdGluZ0ltYWdlcyA9ICEhZXhpc3RpbmdJbWFnZXMubGVuZ3RoLCBoZWlnaHQgPSBvcHRpb25zLmdpZkhlaWdodCwgd2lkdGggPSBvcHRpb25zLmdpZldpZHRoLCBnaWZXcml0ZXIgPSBuZXcgR2lmV3JpdGVyKGJ1ZmZlciwgd2lkdGgsIGhlaWdodCwgZ2lmT3B0aW9ucyksIG9uUmVuZGVyUHJvZ3Jlc3NDYWxsYmFjayA9IHRoaXMub25SZW5kZXJQcm9ncmVzc0NhbGxiYWNrLCBkZWxheSA9IGhhc0V4aXN0aW5nSW1hZ2VzID8gaW50ZXJ2YWwgKiAxMDAgOiAwLCBidWZmZXJUb1N0cmluZywgZ2lmO1xuICAgICAgdGhpcy5nZW5lcmF0aW5nR0lGID0gdHJ1ZTtcbiAgICAgIHV0aWxzLmVhY2goZnJhbWVzLCBmdW5jdGlvbiAoaXRlcmF0b3IsIGZyYW1lKSB7XG4gICAgICAgIHZhciBmcmFtZVBhbGV0dGUgPSBmcmFtZS5wYWxldHRlO1xuICAgICAgICBvblJlbmRlclByb2dyZXNzQ2FsbGJhY2soMC43NSArIDAuMjUgKiBmcmFtZS5wb3NpdGlvbiAqIDEgLyBmcmFtZXMubGVuZ3RoKTtcbiAgICAgICAgZ2lmV3JpdGVyLmFkZEZyYW1lKDAsIDAsIHdpZHRoLCBoZWlnaHQsIGZyYW1lLnBpeGVscywge1xuICAgICAgICAgIHBhbGV0dGU6IGZyYW1lUGFsZXR0ZSxcbiAgICAgICAgICBkZWxheTogZGVsYXlcbiAgICAgICAgfSk7XG4gICAgICB9KTtcbiAgICAgIGdpZldyaXRlci5lbmQoKTtcbiAgICAgIG9uUmVuZGVyUHJvZ3Jlc3NDYWxsYmFjaygxKTtcbiAgICAgIHRoaXMuZnJhbWVzID0gW107XG4gICAgICB0aGlzLmdlbmVyYXRpbmdHSUYgPSBmYWxzZTtcbiAgICAgIGlmICh1dGlscy5pc0Z1bmN0aW9uKGNhbGxiYWNrKSkge1xuICAgICAgICBidWZmZXJUb1N0cmluZyA9IHRoaXMuYnVmZmVyVG9TdHJpbmcoYnVmZmVyKTtcbiAgICAgICAgZ2lmID0gJ2RhdGE6aW1hZ2UvZ2lmO2Jhc2U2NCwnICsgdXRpbHMuYnRvYShidWZmZXJUb1N0cmluZyk7XG4gICAgICAgIGNhbGxiYWNrKGdpZik7XG4gICAgICB9XG4gICAgfSxcbiAgICAnc2V0UmVwZWF0JzogZnVuY3Rpb24gKHIpIHtcbiAgICAgIHRoaXMucmVwZWF0ID0gcjtcbiAgICB9LFxuICAgICdhZGRGcmFtZSc6IGZ1bmN0aW9uIChlbGVtZW50LCBnaWZzaG90T3B0aW9ucykge1xuICAgICAgZ2lmc2hvdE9wdGlvbnMgPSB1dGlscy5pc09iamVjdChnaWZzaG90T3B0aW9ucykgPyBnaWZzaG90T3B0aW9ucyA6IHt9O1xuICAgICAgdmFyIHNlbGYgPSB0aGlzLCBjdHggPSBzZWxmLmN0eCwgb3B0aW9ucyA9IHNlbGYub3B0aW9ucywgd2lkdGggPSBvcHRpb25zLmdpZldpZHRoLCBoZWlnaHQgPSBvcHRpb25zLmdpZkhlaWdodCwgZ2lmSGVpZ2h0ID0gZ2lmc2hvdE9wdGlvbnMuZ2lmSGVpZ2h0LCBnaWZXaWR0aCA9IGdpZnNob3RPcHRpb25zLmdpZldpZHRoLCB0ZXh0ID0gZ2lmc2hvdE9wdGlvbnMudGV4dCwgZm9udFdlaWdodCA9IGdpZnNob3RPcHRpb25zLmZvbnRXZWlnaHQsIGZvbnRTaXplID0gdXRpbHMuZ2V0Rm9udFNpemUoZ2lmc2hvdE9wdGlvbnMpLCBmb250RmFtaWx5ID0gZ2lmc2hvdE9wdGlvbnMuZm9udEZhbWlseSwgZm9udENvbG9yID0gZ2lmc2hvdE9wdGlvbnMuZm9udENvbG9yLCB0ZXh0QWxpZ24gPSBnaWZzaG90T3B0aW9ucy50ZXh0QWxpZ24sIHRleHRCYXNlbGluZSA9IGdpZnNob3RPcHRpb25zLnRleHRCYXNlbGluZSwgdGV4dFhDb29yZGluYXRlID0gZ2lmc2hvdE9wdGlvbnMudGV4dFhDb29yZGluYXRlID8gZ2lmc2hvdE9wdGlvbnMudGV4dFhDb29yZGluYXRlIDogdGV4dEFsaWduID09PSAnbGVmdCcgPyAxIDogdGV4dEFsaWduID09PSAncmlnaHQnID8gd2lkdGggOiB3aWR0aCAvIDIsIHRleHRZQ29vcmRpbmF0ZSA9IGdpZnNob3RPcHRpb25zLnRleHRZQ29vcmRpbmF0ZSA/IGdpZnNob3RPcHRpb25zLnRleHRZQ29vcmRpbmF0ZSA6IHRleHRCYXNlbGluZSA9PT0gJ3RvcCcgPyAxIDogdGV4dEJhc2VsaW5lID09PSAnY2VudGVyJyA/IGhlaWdodCAvIDIgOiBoZWlnaHQsIGZvbnQgPSBmb250V2VpZ2h0ICsgJyAnICsgZm9udFNpemUgKyAnICcgKyBmb250RmFtaWx5LCBpbWFnZURhdGE7XG4gICAgICB0cnkge1xuICAgICAgICBjdHguZHJhd0ltYWdlKGVsZW1lbnQsIDAsIDAsIHdpZHRoLCBoZWlnaHQpO1xuICAgICAgICBpZiAodGV4dCkge1xuICAgICAgICAgIGN0eC5mb250ID0gZm9udDtcbiAgICAgICAgICBjdHguZmlsbFN0eWxlID0gZm9udENvbG9yO1xuICAgICAgICAgIGN0eC50ZXh0QWxpZ24gPSB0ZXh0QWxpZ247XG4gICAgICAgICAgY3R4LnRleHRCYXNlbGluZSA9IHRleHRCYXNlbGluZTtcbiAgICAgICAgICBjdHguZmlsbFRleHQodGV4dCwgdGV4dFhDb29yZGluYXRlLCB0ZXh0WUNvb3JkaW5hdGUpO1xuICAgICAgICB9XG4gICAgICAgIGltYWdlRGF0YSA9IGN0eC5nZXRJbWFnZURhdGEoMCwgMCwgd2lkdGgsIGhlaWdodCk7XG4gICAgICAgIHNlbGYuYWRkRnJhbWVJbWFnZURhdGEoaW1hZ2VEYXRhKTtcbiAgICAgIH0gY2F0Y2ggKGUpIHtcbiAgICAgICAgcmV0dXJuICcnICsgZTtcbiAgICAgIH1cbiAgICB9LFxuICAgICdhZGRGcmFtZUltYWdlRGF0YSc6IGZ1bmN0aW9uIChpbWFnZURhdGEpIHtcbiAgICAgIHZhciBmcmFtZXMgPSB0aGlzLmZyYW1lcywgaW1hZ2VEYXRhQXJyYXkgPSBpbWFnZURhdGEuZGF0YTtcbiAgICAgIHRoaXMuZnJhbWVzLnB1c2goe1xuICAgICAgICAnZGF0YSc6IGltYWdlRGF0YUFycmF5LFxuICAgICAgICAnd2lkdGgnOiBpbWFnZURhdGEud2lkdGgsXG4gICAgICAgICdoZWlnaHQnOiBpbWFnZURhdGEuaGVpZ2h0LFxuICAgICAgICAncGFsZXR0ZSc6IG51bGwsXG4gICAgICAgICdkaXRoZXJpbmcnOiBudWxsLFxuICAgICAgICAnZG9uZSc6IGZhbHNlLFxuICAgICAgICAnYmVpbmdQcm9jZXNzZWQnOiBmYWxzZSxcbiAgICAgICAgJ3Bvc2l0aW9uJzogZnJhbWVzLmxlbmd0aFxuICAgICAgfSk7XG4gICAgfSxcbiAgICAnb25SZW5kZXJQcm9ncmVzcyc6IGZ1bmN0aW9uIChjYWxsYmFjaykge1xuICAgICAgdGhpcy5vblJlbmRlclByb2dyZXNzQ2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgICB9LFxuICAgICdpc1JlbmRlcmluZyc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIHJldHVybiB0aGlzLmdlbmVyYXRpbmdHSUY7XG4gICAgfSxcbiAgICAnZ2V0QmFzZTY0R0lGJzogZnVuY3Rpb24gKGNvbXBsZXRlQ2FsbGJhY2spIHtcbiAgICAgIHZhciBzZWxmID0gdGhpcywgb25SZW5kZXJDb21wbGV0ZSA9IGZ1bmN0aW9uIChnaWYpIHtcbiAgICAgICAgICBzZWxmLmRlc3Ryb3lXb3JrZXJzKCk7XG4gICAgICAgICAgdXRpbHMucmVxdWVzdFRpbWVvdXQoZnVuY3Rpb24gKCkge1xuICAgICAgICAgICAgY29tcGxldGVDYWxsYmFjayhnaWYpO1xuICAgICAgICAgIH0sIDApO1xuICAgICAgICB9O1xuICAgICAgc2VsZi5zdGFydFJlbmRlcmluZyhvblJlbmRlckNvbXBsZXRlKTtcbiAgICB9LFxuICAgICdkZXN0cm95V29ya2Vycyc6IGZ1bmN0aW9uICgpIHtcbiAgICAgIGlmICh0aGlzLndvcmtlckVycm9yKSB7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIHZhciB3b3JrZXJzID0gdGhpcy53b3JrZXJzO1xuICAgICAgdXRpbHMuZWFjaCh3b3JrZXJzLCBmdW5jdGlvbiAoaXRlcmF0b3IsIHdvcmtlck9iaikge1xuICAgICAgICB2YXIgd29ya2VyID0gd29ya2VyT2JqLndvcmtlciwgb2JqZWN0VXJsID0gd29ya2VyT2JqLm9iamVjdFVybDtcbiAgICAgICAgd29ya2VyLnRlcm1pbmF0ZSgpO1xuICAgICAgICB1dGlscy5VUkwucmV2b2tlT2JqZWN0VVJMKG9iamVjdFVybCk7XG4gICAgICB9KTtcbiAgICB9XG4gIH07XG4gIHJldHVybiBBbmltYXRlZEdJRjtcbn0odXRpbHMsIHByb2Nlc3NGcmFtZVdvcmtlciwgTmV1UXVhbnQsIGdpZldyaXRlcik7XG5nZXRCYXNlNjRHSUYgPSBmdW5jdGlvbiBnZXRCYXNlNjRHSUYoYW5pbWF0ZWRHaWZJbnN0YW5jZSwgY2FsbGJhY2spIHtcbiAgYW5pbWF0ZWRHaWZJbnN0YW5jZS5nZXRCYXNlNjRHSUYoZnVuY3Rpb24gKGltYWdlKSB7XG4gICAgY2FsbGJhY2soe1xuICAgICAgJ2Vycm9yJzogZmFsc2UsXG4gICAgICAnZXJyb3JDb2RlJzogJycsXG4gICAgICAnZXJyb3JNc2cnOiAnJyxcbiAgICAgICdpbWFnZSc6IGltYWdlXG4gICAgfSk7XG4gIH0pO1xufTtcbmV4aXN0aW5nSW1hZ2VzID0gZnVuY3Rpb24gKG9iaikge1xuICB2YXIgaW1hZ2VzID0gb2JqLmltYWdlcywgaW1hZ2VzTGVuZ3RoID0gb2JqLmltYWdlc0xlbmd0aCwgY2FsbGJhY2sgPSBvYmouY2FsbGJhY2ssIG9wdGlvbnMgPSBvYmoub3B0aW9ucywgc2tpcE9iaiA9IHtcbiAgICAgICdnZXRVc2VyTWVkaWEnOiB0cnVlLFxuICAgICAgJ3dpbmRvdy5VUkwnOiB0cnVlXG4gICAgfSwgZXJyb3JPYmogPSBlcnJvci52YWxpZGF0ZShza2lwT2JqKSwgbG9hZGVkSW1hZ2VzID0gW10sIGxvYWRlZEltYWdlc0xlbmd0aCA9IDAsIHRlbXBJbWFnZSwgYWc7XG4gIGlmIChlcnJvck9iai5lcnJvcikge1xuICAgIHJldHVybiBjYWxsYmFjayhlcnJvck9iaik7XG4gIH1cbiAgYWcgPSBuZXcgQW5pbWF0ZWRHSUYob3B0aW9ucyk7XG4gIHV0aWxzLmVhY2goaW1hZ2VzLCBmdW5jdGlvbiAoaW5kZXgsIGN1cnJlbnRJbWFnZSkge1xuICAgIGlmICh1dGlscy5pc0VsZW1lbnQoY3VycmVudEltYWdlKSkge1xuICAgICAgaWYgKG9wdGlvbnMuY3Jvc3NPcmlnaW4pIHtcbiAgICAgICAgY3VycmVudEltYWdlLmNyb3NzT3JpZ2luID0gb3B0aW9ucy5jcm9zc09yaWdpbjtcbiAgICAgIH1cbiAgICAgIGxvYWRlZEltYWdlc1tpbmRleF0gPSBjdXJyZW50SW1hZ2U7XG4gICAgICBsb2FkZWRJbWFnZXNMZW5ndGggKz0gMTtcbiAgICAgIGlmIChsb2FkZWRJbWFnZXNMZW5ndGggPT09IGltYWdlc0xlbmd0aCkge1xuICAgICAgICBhZGRMb2FkZWRJbWFnZXNUb0dpZigpO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodXRpbHMuaXNTdHJpbmcoY3VycmVudEltYWdlKSkge1xuICAgICAgdGVtcEltYWdlID0gZG9jdW1lbnQuY3JlYXRlRWxlbWVudCgnaW1nJyk7XG4gICAgICBpZiAob3B0aW9ucy5jcm9zc09yaWdpbikge1xuICAgICAgICB0ZW1wSW1hZ2UuY3Jvc3NPcmlnaW4gPSBvcHRpb25zLmNyb3NzT3JpZ2luO1xuICAgICAgfVxuICAgICAgdGVtcEltYWdlLm9uZXJyb3IgPSBmdW5jdGlvbiAoZSkge1xuICAgICAgICBpZiAobG9hZGVkSW1hZ2VzLmxlbmd0aCA+IGluZGV4KSB7XG4gICAgICAgICAgbG9hZGVkSW1hZ2VzW2luZGV4XSA9IHVuZGVmaW5lZDtcbiAgICAgICAgfVxuICAgICAgfShmdW5jdGlvbiAodGVtcEltYWdlKSB7XG4gICAgICAgIHRlbXBJbWFnZS5vbmxvYWQgPSBmdW5jdGlvbiAoKSB7XG4gICAgICAgICAgbG9hZGVkSW1hZ2VzW2luZGV4XSA9IHRlbXBJbWFnZTtcbiAgICAgICAgICBsb2FkZWRJbWFnZXNMZW5ndGggKz0gMTtcbiAgICAgICAgICBpZiAobG9hZGVkSW1hZ2VzTGVuZ3RoID09PSBpbWFnZXNMZW5ndGgpIHtcbiAgICAgICAgICAgIGFkZExvYWRlZEltYWdlc1RvR2lmKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHV0aWxzLnJlbW92ZUVsZW1lbnQodGVtcEltYWdlKTtcbiAgICAgICAgfTtcbiAgICAgIH0odGVtcEltYWdlKSk7XG4gICAgICB0ZW1wSW1hZ2Uuc3JjID0gY3VycmVudEltYWdlO1xuICAgICAgdXRpbHMuc2V0Q1NTQXR0cih0ZW1wSW1hZ2UsIHtcbiAgICAgICAgJ3Bvc2l0aW9uJzogJ2ZpeGVkJyxcbiAgICAgICAgJ29wYWNpdHknOiAnMCdcbiAgICAgIH0pO1xuICAgICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh0ZW1wSW1hZ2UpO1xuICAgIH1cbiAgfSk7XG4gIGZ1bmN0aW9uIGFkZExvYWRlZEltYWdlc1RvR2lmKCkge1xuICAgIHV0aWxzLmVhY2gobG9hZGVkSW1hZ2VzLCBmdW5jdGlvbiAoaW5kZXgsIGxvYWRlZEltYWdlKSB7XG4gICAgICBpZiAobG9hZGVkSW1hZ2UpIHtcbiAgICAgICAgYWcuYWRkRnJhbWUobG9hZGVkSW1hZ2UsIG9wdGlvbnMpO1xuICAgICAgfVxuICAgIH0pO1xuICAgIGdldEJhc2U2NEdJRihhZywgY2FsbGJhY2spO1xuICB9XG59O1xuc2NyZWVuU2hvdCA9IHtcbiAgZ2V0R0lGOiBmdW5jdGlvbiAob3B0aW9ucywgY2FsbGJhY2spIHtcbiAgICBjYWxsYmFjayA9IHV0aWxzLmlzRnVuY3Rpb24oY2FsbGJhY2spID8gY2FsbGJhY2sgOiB1dGlscy5ub29wO1xuICAgIHZhciBjYW52YXMgPSBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCdjYW52YXMnKSwgY29udGV4dCwgZXhpc3RpbmdJbWFnZXMgPSBvcHRpb25zLmltYWdlcywgaGFzRXhpc3RpbmdJbWFnZXMgPSAhIWV4aXN0aW5nSW1hZ2VzLmxlbmd0aCwgdmlkZW9FbGVtZW50ID0gb3B0aW9ucy52aWRlb0VsZW1lbnQsIGtlZXBDYW1lcmFPbiA9IG9wdGlvbnMua2VlcENhbWVyYU9uLCB3ZWJjYW1WaWRlb0VsZW1lbnQgPSBvcHRpb25zLndlYmNhbVZpZGVvRWxlbWVudCwgY2FtZXJhU3RyZWFtID0gb3B0aW9ucy5jYW1lcmFTdHJlYW0sIGdpZldpZHRoID0gK29wdGlvbnMuZ2lmV2lkdGgsIGdpZkhlaWdodCA9ICtvcHRpb25zLmdpZkhlaWdodCwgdmlkZW9XaWR0aCA9IG9wdGlvbnMudmlkZW9XaWR0aCwgdmlkZW9IZWlnaHQgPSBvcHRpb25zLnZpZGVvSGVpZ2h0LCBzYW1wbGVJbnRlcnZhbCA9ICtvcHRpb25zLnNhbXBsZUludGVydmFsLCBudW1Xb3JrZXJzID0gK29wdGlvbnMubnVtV29ya2VycywgY3JvcCA9IG9wdGlvbnMuY3JvcCwgaW50ZXJ2YWwgPSArb3B0aW9ucy5pbnRlcnZhbCwgd2FpdEJldHdlZW5GcmFtZXMgPSBoYXNFeGlzdGluZ0ltYWdlcyA/IDAgOiBpbnRlcnZhbCAqIDEwMDAsIHByb2dyZXNzQ2FsbGJhY2sgPSBvcHRpb25zLnByb2dyZXNzQ2FsbGJhY2ssIHNhdmVkUmVuZGVyaW5nQ29udGV4dHMgPSBvcHRpb25zLnNhdmVkUmVuZGVyaW5nQ29udGV4dHMsIHNhdmVSZW5kZXJpbmdDb250ZXh0cyA9IG9wdGlvbnMuc2F2ZVJlbmRlcmluZ0NvbnRleHRzLCByZW5kZXJpbmdDb250ZXh0c1RvU2F2ZSA9IFtdLCBudW1GcmFtZXMgPSBzYXZlZFJlbmRlcmluZ0NvbnRleHRzLmxlbmd0aCA/IHNhdmVkUmVuZGVyaW5nQ29udGV4dHMubGVuZ3RoIDogb3B0aW9ucy5udW1GcmFtZXMsIHBlbmRpbmdGcmFtZXMgPSBudW1GcmFtZXMsIGFnID0gbmV3IEFuaW1hdGVkR0lGKG9wdGlvbnMpLCB0ZXh0ID0gb3B0aW9ucy50ZXh0LCBmb250V2VpZ2h0ID0gb3B0aW9ucy5mb250V2VpZ2h0LCBmb250U2l6ZSA9IHV0aWxzLmdldEZvbnRTaXplKG9wdGlvbnMpLCBmb250RmFtaWx5ID0gb3B0aW9ucy5mb250RmFtaWx5LCBmb250Q29sb3IgPSBvcHRpb25zLmZvbnRDb2xvciwgdGV4dEFsaWduID0gb3B0aW9ucy50ZXh0QWxpZ24sIHRleHRCYXNlbGluZSA9IG9wdGlvbnMudGV4dEJhc2VsaW5lLCB0ZXh0WENvb3JkaW5hdGUgPSBvcHRpb25zLnRleHRYQ29vcmRpbmF0ZSA/IG9wdGlvbnMudGV4dFhDb29yZGluYXRlIDogdGV4dEFsaWduID09PSAnbGVmdCcgPyAxIDogdGV4dEFsaWduID09PSAncmlnaHQnID8gZ2lmV2lkdGggOiBnaWZXaWR0aCAvIDIsIHRleHRZQ29vcmRpbmF0ZSA9IG9wdGlvbnMudGV4dFlDb29yZGluYXRlID8gb3B0aW9ucy50ZXh0WUNvb3JkaW5hdGUgOiB0ZXh0QmFzZWxpbmUgPT09ICd0b3AnID8gMSA6IHRleHRCYXNlbGluZSA9PT0gJ2NlbnRlcicgPyBnaWZIZWlnaHQgLyAyIDogZ2lmSGVpZ2h0LCBmb250ID0gZm9udFdlaWdodCArICcgJyArIGZvbnRTaXplICsgJyAnICsgZm9udEZhbWlseSwgc291cmNlWCA9IGNyb3AgPyBNYXRoLmZsb29yKGNyb3Auc2NhbGVkV2lkdGggLyAyKSA6IDAsIHNvdXJjZVdpZHRoID0gY3JvcCA/IHZpZGVvV2lkdGggLSBjcm9wLnNjYWxlZFdpZHRoIDogMCwgc291cmNlWSA9IGNyb3AgPyBNYXRoLmZsb29yKGNyb3Auc2NhbGVkSGVpZ2h0IC8gMikgOiAwLCBzb3VyY2VIZWlnaHQgPSBjcm9wID8gdmlkZW9IZWlnaHQgLSBjcm9wLnNjYWxlZEhlaWdodCA6IDAsIGNhcHR1cmVGcmFtZXMgPSBmdW5jdGlvbiBjYXB0dXJlRnJhbWUoKSB7XG4gICAgICAgIHZhciBmcmFtZXNMZWZ0ID0gcGVuZGluZ0ZyYW1lcyAtIDE7XG4gICAgICAgIGlmIChzYXZlZFJlbmRlcmluZ0NvbnRleHRzLmxlbmd0aCkge1xuICAgICAgICAgIGNvbnRleHQucHV0SW1hZ2VEYXRhKHNhdmVkUmVuZGVyaW5nQ29udGV4dHNbbnVtRnJhbWVzIC0gcGVuZGluZ0ZyYW1lc10sIDAsIDApO1xuICAgICAgICAgIGZpbmlzaENhcHR1cmUoKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICBkcmF3VmlkZW8oKTtcbiAgICAgICAgfVxuICAgICAgICBmdW5jdGlvbiBkcmF3VmlkZW8oKSB7XG4gICAgICAgICAgdHJ5IHtcbiAgICAgICAgICAgIGlmIChzb3VyY2VXaWR0aCA+IHZpZGVvV2lkdGgpIHtcbiAgICAgICAgICAgICAgc291cmNlV2lkdGggPSB2aWRlb1dpZHRoO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNvdXJjZUhlaWdodCA+IHZpZGVvSGVpZ2h0KSB7XG4gICAgICAgICAgICAgIHNvdXJjZUhlaWdodCA9IHZpZGVvSGVpZ2h0O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNvdXJjZVggPCAwKSB7XG4gICAgICAgICAgICAgIHNvdXJjZVggPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgaWYgKHNvdXJjZVkgPCAwKSB7XG4gICAgICAgICAgICAgIHNvdXJjZVkgPSAwO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgY29udGV4dC5kcmF3SW1hZ2UodmlkZW9FbGVtZW50LCBzb3VyY2VYLCBzb3VyY2VZLCBzb3VyY2VXaWR0aCwgc291cmNlSGVpZ2h0LCAwLCAwLCBnaWZXaWR0aCwgZ2lmSGVpZ2h0KTtcbiAgICAgICAgICAgIGZpbmlzaENhcHR1cmUoKTtcbiAgICAgICAgICB9IGNhdGNoIChlKSB7XG4gICAgICAgICAgICBpZiAoZS5uYW1lID09PSAnTlNfRVJST1JfTk9UX0FWQUlMQUJMRScpIHtcbiAgICAgICAgICAgICAgdXRpbHMucmVxdWVzdFRpbWVvdXQoZHJhd1ZpZGVvLCAxMDApO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgdGhyb3cgZTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgZnVuY3Rpb24gZmluaXNoQ2FwdHVyZSgpIHtcbiAgICAgICAgICBwZW5kaW5nRnJhbWVzID0gZnJhbWVzTGVmdDtcbiAgICAgICAgICB2YXIgcHJvY2Vzc2VkRnJhbWVzID0gbnVtRnJhbWVzIC0gcGVuZGluZ0ZyYW1lcztcbiAgICAgICAgICB2YXIgaW1hZ2VEYXRhO1xuICAgICAgICAgIHZhciBkYXRhO1xuICAgICAgICAgIHZhciByZ2JhO1xuICAgICAgICAgIHZhciBpc0JsYWNrRnJhbWU7XG4gICAgICAgICAgaWYgKHNhdmVSZW5kZXJpbmdDb250ZXh0cykge1xuICAgICAgICAgICAgcmVuZGVyaW5nQ29udGV4dHNUb1NhdmUucHVzaChjb250ZXh0LmdldEltYWdlRGF0YSgwLCAwLCBnaWZXaWR0aCwgZ2lmSGVpZ2h0KSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGlmICh0ZXh0KSB7XG4gICAgICAgICAgICBjb250ZXh0LmZvbnQgPSBmb250O1xuICAgICAgICAgICAgY29udGV4dC5maWxsU3R5bGUgPSBmb250Q29sb3I7XG4gICAgICAgICAgICBjb250ZXh0LnRleHRBbGlnbiA9IHRleHRBbGlnbjtcbiAgICAgICAgICAgIGNvbnRleHQudGV4dEJhc2VsaW5lID0gdGV4dEJhc2VsaW5lO1xuICAgICAgICAgICAgY29udGV4dC5maWxsVGV4dCh0ZXh0LCB0ZXh0WENvb3JkaW5hdGUsIHRleHRZQ29vcmRpbmF0ZSk7XG4gICAgICAgICAgfVxuICAgICAgICAgIGltYWdlRGF0YSA9IGNvbnRleHQuZ2V0SW1hZ2VEYXRhKDAsIDAsIGdpZldpZHRoLCBnaWZIZWlnaHQpO1xuICAgICAgICAgIGRhdGEgPSBpbWFnZURhdGEuZGF0YTtcbiAgICAgICAgICByZ2JhID0gZGF0YVswXSArIGRhdGFbMV0gKyBkYXRhWzJdICsgZGF0YVszXTtcbiAgICAgICAgICBpc0JsYWNrRnJhbWUgPSByZ2JhID09PSAwO1xuICAgICAgICAgIGlmICghaXNCbGFja0ZyYW1lKSB7XG4gICAgICAgICAgICBhZy5hZGRGcmFtZUltYWdlRGF0YShpbWFnZURhdGEpO1xuICAgICAgICAgIH0gZWxzZSBpZiAocHJvY2Vzc2VkRnJhbWVzID09PSAxICYmIG51bUZyYW1lcyA9PT0gMSkge1xuICAgICAgICAgICAgZHJhd1ZpZGVvKCk7XG4gICAgICAgICAgfVxuICAgICAgICAgIHByb2dyZXNzQ2FsbGJhY2socHJvY2Vzc2VkRnJhbWVzIC8gbnVtRnJhbWVzKTtcbiAgICAgICAgICBpZiAoZnJhbWVzTGVmdCA+IDApIHtcbiAgICAgICAgICAgIHV0aWxzLnJlcXVlc3RUaW1lb3V0KGNhcHR1cmVGcmFtZSwgd2FpdEJldHdlZW5GcmFtZXMpO1xuICAgICAgICAgIH1cbiAgICAgICAgICBpZiAoIXBlbmRpbmdGcmFtZXMpIHtcbiAgICAgICAgICAgIGFnLmdldEJhc2U2NEdJRihmdW5jdGlvbiAoaW1hZ2UpIHtcbiAgICAgICAgICAgICAgY2FsbGJhY2soe1xuICAgICAgICAgICAgICAgICdlcnJvcic6IGZhbHNlLFxuICAgICAgICAgICAgICAgICdlcnJvckNvZGUnOiAnJyxcbiAgICAgICAgICAgICAgICAnZXJyb3JNc2cnOiAnJyxcbiAgICAgICAgICAgICAgICAnaW1hZ2UnOiBpbWFnZSxcbiAgICAgICAgICAgICAgICAnY2FtZXJhU3RyZWFtJzogY2FtZXJhU3RyZWFtLFxuICAgICAgICAgICAgICAgICd2aWRlb0VsZW1lbnQnOiB2aWRlb0VsZW1lbnQsXG4gICAgICAgICAgICAgICAgJ3dlYmNhbVZpZGVvRWxlbWVudCc6IHdlYmNhbVZpZGVvRWxlbWVudCxcbiAgICAgICAgICAgICAgICAnc2F2ZWRSZW5kZXJpbmdDb250ZXh0cyc6IHJlbmRlcmluZ0NvbnRleHRzVG9TYXZlLFxuICAgICAgICAgICAgICAgICdrZWVwQ2FtZXJhT24nOiBrZWVwQ2FtZXJhT25cbiAgICAgICAgICAgICAgfSk7XG4gICAgICAgICAgICB9KTtcbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH07XG4gICAgbnVtRnJhbWVzID0gbnVtRnJhbWVzICE9IG51bGwgPyBudW1GcmFtZXMgOiAxMDtcbiAgICBpbnRlcnZhbCA9IGludGVydmFsICE9IG51bGwgPyBpbnRlcnZhbCA6IDAuMTtcbiAgICBjYW52YXMud2lkdGggPSBnaWZXaWR0aDtcbiAgICBjYW52YXMuaGVpZ2h0ID0gZ2lmSGVpZ2h0O1xuICAgIGNvbnRleHQgPSBjYW52YXMuZ2V0Q29udGV4dCgnMmQnKTtcbiAgICAoZnVuY3Rpb24gY2FwdHVyZSgpIHtcbiAgICAgIGlmICghc2F2ZWRSZW5kZXJpbmdDb250ZXh0cy5sZW5ndGggJiYgdmlkZW9FbGVtZW50LmN1cnJlbnRUaW1lID09PSAwKSB7XG4gICAgICAgIHV0aWxzLnJlcXVlc3RUaW1lb3V0KGNhcHR1cmUsIDEwMCk7XG4gICAgICAgIHJldHVybjtcbiAgICAgIH1cbiAgICAgIGNhcHR1cmVGcmFtZXMoKTtcbiAgICB9KCkpO1xuICB9LFxuICAnZ2V0Q3JvcERpbWVuc2lvbnMnOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIHdpZHRoID0gb2JqLnZpZGVvV2lkdGgsIGhlaWdodCA9IG9iai52aWRlb0hlaWdodCwgZ2lmV2lkdGggPSBvYmouZ2lmV2lkdGgsIGdpZkhlaWdodCA9IG9iai5naWZIZWlnaHQsIHJlc3VsdCA9IHtcbiAgICAgICAgd2lkdGg6IDAsXG4gICAgICAgIGhlaWdodDogMCxcbiAgICAgICAgc2NhbGVkV2lkdGg6IDAsXG4gICAgICAgIHNjYWxlZEhlaWdodDogMFxuICAgICAgfTtcbiAgICBpZiAod2lkdGggPiBoZWlnaHQpIHtcbiAgICAgIHJlc3VsdC53aWR0aCA9IE1hdGgucm91bmQod2lkdGggKiAoZ2lmSGVpZ2h0IC8gaGVpZ2h0KSkgLSBnaWZXaWR0aDtcbiAgICAgIHJlc3VsdC5zY2FsZWRXaWR0aCA9IE1hdGgucm91bmQocmVzdWx0LndpZHRoICogKGhlaWdodCAvIGdpZkhlaWdodCkpO1xuICAgIH0gZWxzZSB7XG4gICAgICByZXN1bHQuaGVpZ2h0ID0gTWF0aC5yb3VuZChoZWlnaHQgKiAoZ2lmV2lkdGggLyB3aWR0aCkpIC0gZ2lmSGVpZ2h0O1xuICAgICAgcmVzdWx0LnNjYWxlZEhlaWdodCA9IE1hdGgucm91bmQocmVzdWx0LmhlaWdodCAqICh3aWR0aCAvIGdpZldpZHRoKSk7XG4gICAgfVxuICAgIHJldHVybiByZXN1bHQ7XG4gIH1cbn07XG52aWRlb1N0cmVhbSA9IHtcbiAgJ2xvYWRlZERhdGEnOiBmYWxzZSxcbiAgJ2RlZmF1bHRWaWRlb0RpbWVuc2lvbnMnOiB7XG4gICAgJ3dpZHRoJzogNjQwLFxuICAgICdoZWlnaHQnOiA0ODBcbiAgfSxcbiAgJ2ZpbmRWaWRlb1NpemUnOiBmdW5jdGlvbiBmaW5kVmlkZW9TaXplTWV0aG9kKG9iaikge1xuICAgIGZpbmRWaWRlb1NpemVNZXRob2QuYXR0ZW1wdHMgPSBmaW5kVmlkZW9TaXplTWV0aG9kLmF0dGVtcHRzIHx8IDA7XG4gICAgdmFyIHNlbGYgPSB0aGlzLCB2aWRlb0VsZW1lbnQgPSBvYmoudmlkZW9FbGVtZW50LCBjYW1lcmFTdHJlYW0gPSBvYmouY2FtZXJhU3RyZWFtLCBjb21wbGV0ZWRDYWxsYmFjayA9IG9iai5jb21wbGV0ZWRDYWxsYmFjaztcbiAgICBpZiAoIXZpZGVvRWxlbWVudCkge1xuICAgICAgcmV0dXJuO1xuICAgIH1cbiAgICBpZiAodmlkZW9FbGVtZW50LnZpZGVvV2lkdGggPiAwICYmIHZpZGVvRWxlbWVudC52aWRlb0hlaWdodCA+IDApIHtcbiAgICAgIHZpZGVvRWxlbWVudC5yZW1vdmVFdmVudExpc3RlbmVyKCdsb2FkZWRkYXRhJywgc2VsZi5maW5kVmlkZW9TaXplKTtcbiAgICAgIGNvbXBsZXRlZENhbGxiYWNrKHtcbiAgICAgICAgJ3ZpZGVvRWxlbWVudCc6IHZpZGVvRWxlbWVudCxcbiAgICAgICAgJ2NhbWVyYVN0cmVhbSc6IGNhbWVyYVN0cmVhbSxcbiAgICAgICAgJ3ZpZGVvV2lkdGgnOiB2aWRlb0VsZW1lbnQudmlkZW9XaWR0aCxcbiAgICAgICAgJ3ZpZGVvSGVpZ2h0JzogdmlkZW9FbGVtZW50LnZpZGVvSGVpZ2h0XG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgaWYgKGZpbmRWaWRlb1NpemVNZXRob2QuYXR0ZW1wdHMgPCAxMCkge1xuICAgICAgICBmaW5kVmlkZW9TaXplTWV0aG9kLmF0dGVtcHRzICs9IDE7XG4gICAgICAgIHV0aWxzLnJlcXVlc3RUaW1lb3V0KGZ1bmN0aW9uICgpIHtcbiAgICAgICAgICBzZWxmLmZpbmRWaWRlb1NpemUob2JqKTtcbiAgICAgICAgfSwgMjAwKTtcbiAgICAgIH0gZWxzZSB7XG4gICAgICAgIGNvbXBsZXRlZENhbGxiYWNrKHtcbiAgICAgICAgICAndmlkZW9FbGVtZW50JzogdmlkZW9FbGVtZW50LFxuICAgICAgICAgICdjYW1lcmFTdHJlYW0nOiBjYW1lcmFTdHJlYW0sXG4gICAgICAgICAgJ3ZpZGVvV2lkdGgnOiBzZWxmLmRlZmF1bHRWaWRlb0RpbWVuc2lvbnMud2lkdGgsXG4gICAgICAgICAgJ3ZpZGVvSGVpZ2h0Jzogc2VsZi5kZWZhdWx0VmlkZW9EaW1lbnNpb25zLmhlaWdodFxuICAgICAgICB9KTtcbiAgICAgIH1cbiAgICB9XG4gIH0sXG4gICdvblN0cmVhbWluZ1RpbWVvdXQnOiBmdW5jdGlvbiAoY2FsbGJhY2spIHtcbiAgICBpZiAodXRpbHMuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICAgIGNhbGxiYWNrKHtcbiAgICAgICAgJ2Vycm9yJzogdHJ1ZSxcbiAgICAgICAgJ2Vycm9yQ29kZSc6ICdnZXRVc2VyTWVkaWEnLFxuICAgICAgICAnZXJyb3JNc2cnOiAnVGhlcmUgd2FzIGFuIGlzc3VlIHdpdGggdGhlIGdldFVzZXJNZWRpYSBBUEkgLSBUaW1lZCBvdXQgd2hpbGUgdHJ5aW5nIHRvIHN0YXJ0IHN0cmVhbWluZycsXG4gICAgICAgICdpbWFnZSc6IG51bGwsXG4gICAgICAgICdjYW1lcmFTdHJlYW0nOiB7fVxuICAgICAgfSk7XG4gICAgfVxuICB9LFxuICAnc3RyZWFtJzogZnVuY3Rpb24gKG9iaikge1xuICAgIHZhciBzZWxmID0gdGhpcywgZXhpc3RpbmdWaWRlbyA9IHV0aWxzLmlzQXJyYXkob2JqLmV4aXN0aW5nVmlkZW8pID8gb2JqLmV4aXN0aW5nVmlkZW9bMF0gOiBvYmouZXhpc3RpbmdWaWRlbywgdmlkZW9FbGVtZW50ID0gb2JqLnZpZGVvRWxlbWVudCwgY2FtZXJhU3RyZWFtID0gb2JqLmNhbWVyYVN0cmVhbSwgc3RyZWFtZWRDYWxsYmFjayA9IG9iai5zdHJlYW1lZENhbGxiYWNrLCBjb21wbGV0ZWRDYWxsYmFjayA9IG9iai5jb21wbGV0ZWRDYWxsYmFjaztcbiAgICBpZiAodXRpbHMuaXNGdW5jdGlvbihzdHJlYW1lZENhbGxiYWNrKSkge1xuICAgICAgc3RyZWFtZWRDYWxsYmFjaygpO1xuICAgIH1cbiAgICBpZiAoZXhpc3RpbmdWaWRlbykge1xuICAgICAgaWYgKHV0aWxzLmlzU3RyaW5nKGV4aXN0aW5nVmlkZW8pKSB7XG4gICAgICAgIHZpZGVvRWxlbWVudC5zcmMgPSBleGlzdGluZ1ZpZGVvO1xuICAgICAgICB2aWRlb0VsZW1lbnQuaW5uZXJIVE1MID0gJzxzb3VyY2Ugc3JjPVwiJyArIGV4aXN0aW5nVmlkZW8gKyAnXCIgdHlwZT1cInZpZGVvLycgKyB1dGlscy5nZXRFeHRlbnNpb24oZXhpc3RpbmdWaWRlbykgKyAnXCIgLz4nO1xuICAgICAgfVxuICAgIH0gZWxzZSBpZiAodmlkZW9FbGVtZW50Lm1velNyY09iamVjdCkge1xuICAgICAgdmlkZW9FbGVtZW50Lm1velNyY09iamVjdCA9IGNhbWVyYVN0cmVhbTtcbiAgICB9IGVsc2UgaWYgKHV0aWxzLlVSTCkge1xuICAgICAgdmlkZW9FbGVtZW50LnNyYyA9IHV0aWxzLlVSTC5jcmVhdGVPYmplY3RVUkwoY2FtZXJhU3RyZWFtKTtcbiAgICB9XG4gICAgdmlkZW9FbGVtZW50LnBsYXkoKTtcbiAgICB1dGlscy5yZXF1ZXN0VGltZW91dChmdW5jdGlvbiBjaGVja0xvYWRlZERhdGEoKSB7XG4gICAgICBjaGVja0xvYWRlZERhdGEuY291bnQgPSBjaGVja0xvYWRlZERhdGEuY291bnQgfHwgMDtcbiAgICAgIGlmIChzZWxmLmxvYWRlZERhdGEgPT09IHRydWUpIHtcbiAgICAgICAgc2VsZi5maW5kVmlkZW9TaXplKHtcbiAgICAgICAgICAndmlkZW9FbGVtZW50JzogdmlkZW9FbGVtZW50LFxuICAgICAgICAgICdjYW1lcmFTdHJlYW0nOiBjYW1lcmFTdHJlYW0sXG4gICAgICAgICAgJ2NvbXBsZXRlZENhbGxiYWNrJzogY29tcGxldGVkQ2FsbGJhY2tcbiAgICAgICAgfSk7XG4gICAgICAgIHNlbGYubG9hZGVkRGF0YSA9IGZhbHNlO1xuICAgICAgfSBlbHNlIHtcbiAgICAgICAgY2hlY2tMb2FkZWREYXRhLmNvdW50ICs9IDE7XG4gICAgICAgIGlmIChjaGVja0xvYWRlZERhdGEuY291bnQgPiAxMCkge1xuICAgICAgICAgIHNlbGYuZmluZFZpZGVvU2l6ZSh7XG4gICAgICAgICAgICAndmlkZW9FbGVtZW50JzogdmlkZW9FbGVtZW50LFxuICAgICAgICAgICAgJ2NhbWVyYVN0cmVhbSc6IGNhbWVyYVN0cmVhbSxcbiAgICAgICAgICAgICdjb21wbGV0ZWRDYWxsYmFjayc6IGNvbXBsZXRlZENhbGxiYWNrXG4gICAgICAgICAgfSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgY2hlY2tMb2FkZWREYXRhKCk7XG4gICAgICAgIH1cbiAgICAgIH1cbiAgICB9LCAxMDApO1xuICB9LFxuICAnc3RhcnRTdHJlYW1pbmcnOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgdmFyIHNlbGYgPSB0aGlzLCBlcnJvckNhbGxiYWNrID0gdXRpbHMuaXNGdW5jdGlvbihvYmouZXJyb3IpID8gb2JqLmVycm9yIDogdXRpbHMubm9vcCwgc3RyZWFtZWRDYWxsYmFjayA9IHV0aWxzLmlzRnVuY3Rpb24ob2JqLnN0cmVhbWVkKSA/IG9iai5zdHJlYW1lZCA6IHV0aWxzLm5vb3AsIGNvbXBsZXRlZENhbGxiYWNrID0gdXRpbHMuaXNGdW5jdGlvbihvYmouY29tcGxldGVkKSA/IG9iai5jb21wbGV0ZWQgOiB1dGlscy5ub29wLCBleGlzdGluZ1ZpZGVvID0gb2JqLmV4aXN0aW5nVmlkZW8sIHdlYmNhbVZpZGVvRWxlbWVudCA9IG9iai53ZWJjYW1WaWRlb0VsZW1lbnQsIHZpZGVvRWxlbWVudCA9IHV0aWxzLmlzRWxlbWVudChleGlzdGluZ1ZpZGVvKSA/IGV4aXN0aW5nVmlkZW8gOiB3ZWJjYW1WaWRlb0VsZW1lbnQgPyB3ZWJjYW1WaWRlb0VsZW1lbnQgOiBkb2N1bWVudC5jcmVhdGVFbGVtZW50KCd2aWRlbycpLCBsYXN0Q2FtZXJhU3RyZWFtID0gb2JqLmxhc3RDYW1lcmFTdHJlYW0sIGNyb3NzT3JpZ2luID0gb2JqLmNyb3NzT3JpZ2luLCBvcHRpb25zID0gb2JqLm9wdGlvbnMsIGNhbWVyYVN0cmVhbTtcbiAgICBpZiAoY3Jvc3NPcmlnaW4pIHtcbiAgICAgIHZpZGVvRWxlbWVudC5jcm9zc09yaWdpbiA9IG9wdGlvbnMuY3Jvc3NPcmlnaW47XG4gICAgfVxuICAgIHZpZGVvRWxlbWVudC5hdXRvcGxheSA9IHRydWU7XG4gICAgdmlkZW9FbGVtZW50Lmxvb3AgPSB0cnVlO1xuICAgIHZpZGVvRWxlbWVudC5tdXRlZCA9IHRydWU7XG4gICAgdmlkZW9FbGVtZW50LmFkZEV2ZW50TGlzdGVuZXIoJ2xvYWRlZGRhdGEnLCBmdW5jdGlvbiAoZXZlbnQpIHtcbiAgICAgIHNlbGYubG9hZGVkRGF0YSA9IHRydWU7XG4gICAgfSk7XG4gICAgaWYgKGV4aXN0aW5nVmlkZW8pIHtcbiAgICAgIHNlbGYuc3RyZWFtKHtcbiAgICAgICAgJ3ZpZGVvRWxlbWVudCc6IHZpZGVvRWxlbWVudCxcbiAgICAgICAgJ2V4aXN0aW5nVmlkZW8nOiBleGlzdGluZ1ZpZGVvLFxuICAgICAgICAnY29tcGxldGVkQ2FsbGJhY2snOiBjb21wbGV0ZWRDYWxsYmFja1xuICAgICAgfSk7XG4gICAgfSBlbHNlIGlmIChsYXN0Q2FtZXJhU3RyZWFtKSB7XG4gICAgICBzZWxmLnN0cmVhbSh7XG4gICAgICAgICd2aWRlb0VsZW1lbnQnOiB2aWRlb0VsZW1lbnQsXG4gICAgICAgICdjYW1lcmFTdHJlYW0nOiBsYXN0Q2FtZXJhU3RyZWFtLFxuICAgICAgICAnc3RyZWFtZWRDYWxsYmFjayc6IHN0cmVhbWVkQ2FsbGJhY2ssXG4gICAgICAgICdjb21wbGV0ZWRDYWxsYmFjayc6IGNvbXBsZXRlZENhbGxiYWNrXG4gICAgICB9KTtcbiAgICB9IGVsc2Uge1xuICAgICAgdXRpbHMuZ2V0VXNlck1lZGlhKHsgJ3ZpZGVvJzogdHJ1ZSB9LCBmdW5jdGlvbiAoc3RyZWFtKSB7XG4gICAgICAgIHNlbGYuc3RyZWFtKHtcbiAgICAgICAgICAndmlkZW9FbGVtZW50JzogdmlkZW9FbGVtZW50LFxuICAgICAgICAgICdjYW1lcmFTdHJlYW0nOiBzdHJlYW0sXG4gICAgICAgICAgJ3N0cmVhbWVkQ2FsbGJhY2snOiBzdHJlYW1lZENhbGxiYWNrLFxuICAgICAgICAgICdjb21wbGV0ZWRDYWxsYmFjayc6IGNvbXBsZXRlZENhbGxiYWNrXG4gICAgICAgIH0pO1xuICAgICAgfSwgZXJyb3JDYWxsYmFjayk7XG4gICAgfVxuICB9LFxuICBzdGFydFZpZGVvU3RyZWFtaW5nOiBmdW5jdGlvbiAoY2FsbGJhY2ssIG9wdGlvbnMpIHtcbiAgICBvcHRpb25zID0gb3B0aW9ucyB8fCB7fTtcbiAgICB2YXIgc2VsZiA9IHRoaXMsIG5vR2V0VXNlck1lZGlhU3VwcG9ydFRpbWVvdXQsIHRpbWVvdXRMZW5ndGggPSBvcHRpb25zLnRpbWVvdXQgIT09IHVuZGVmaW5lZCA/IG9wdGlvbnMudGltZW91dCA6IDAsIG9yaWdpbmFsQ2FsbGJhY2sgPSBvcHRpb25zLmNhbGxiYWNrLCB3ZWJjYW1WaWRlb0VsZW1lbnQgPSBvcHRpb25zLndlYmNhbVZpZGVvRWxlbWVudDtcbiAgICBpZiAodGltZW91dExlbmd0aCA+IDApIHtcbiAgICAgIG5vR2V0VXNlck1lZGlhU3VwcG9ydFRpbWVvdXQgPSB1dGlscy5yZXF1ZXN0VGltZW91dChmdW5jdGlvbiAoKSB7XG4gICAgICAgIHNlbGYub25TdHJlYW1pbmdUaW1lb3V0KG9yaWdpbmFsQ2FsbGJhY2spO1xuICAgICAgfSwgMTAwMDApO1xuICAgIH1cbiAgICB0aGlzLnN0YXJ0U3RyZWFtaW5nKHtcbiAgICAgICdlcnJvcic6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgb3JpZ2luYWxDYWxsYmFjayh7XG4gICAgICAgICAgJ2Vycm9yJzogdHJ1ZSxcbiAgICAgICAgICAnZXJyb3JDb2RlJzogJ2dldFVzZXJNZWRpYScsXG4gICAgICAgICAgJ2Vycm9yTXNnJzogJ1RoZXJlIHdhcyBhbiBpc3N1ZSB3aXRoIHRoZSBnZXRVc2VyTWVkaWEgQVBJIC0gdGhlIHVzZXIgcHJvYmFibHkgZGVuaWVkIHBlcm1pc3Npb24nLFxuICAgICAgICAgICdpbWFnZSc6IG51bGwsXG4gICAgICAgICAgJ2NhbWVyYVN0cmVhbSc6IHt9XG4gICAgICAgIH0pO1xuICAgICAgfSxcbiAgICAgICdzdHJlYW1lZCc6IGZ1bmN0aW9uICgpIHtcbiAgICAgICAgY2xlYXJUaW1lb3V0KG5vR2V0VXNlck1lZGlhU3VwcG9ydFRpbWVvdXQpO1xuICAgICAgfSxcbiAgICAgICdjb21wbGV0ZWQnOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgICAgIHZhciBjYW1lcmFTdHJlYW0gPSBvYmouY2FtZXJhU3RyZWFtLCB2aWRlb0VsZW1lbnQgPSBvYmoudmlkZW9FbGVtZW50LCB2aWRlb1dpZHRoID0gb2JqLnZpZGVvV2lkdGgsIHZpZGVvSGVpZ2h0ID0gb2JqLnZpZGVvSGVpZ2h0O1xuICAgICAgICBjYWxsYmFjayh7XG4gICAgICAgICAgJ2NhbWVyYVN0cmVhbSc6IGNhbWVyYVN0cmVhbSxcbiAgICAgICAgICAndmlkZW9FbGVtZW50JzogdmlkZW9FbGVtZW50LFxuICAgICAgICAgICd2aWRlb1dpZHRoJzogdmlkZW9XaWR0aCxcbiAgICAgICAgICAndmlkZW9IZWlnaHQnOiB2aWRlb0hlaWdodFxuICAgICAgICB9KTtcbiAgICAgIH0sXG4gICAgICAnbGFzdENhbWVyYVN0cmVhbSc6IG9wdGlvbnMubGFzdENhbWVyYVN0cmVhbSxcbiAgICAgICd3ZWJjYW1WaWRlb0VsZW1lbnQnOiB3ZWJjYW1WaWRlb0VsZW1lbnQsXG4gICAgICAnY3Jvc3NPcmlnaW4nOiBvcHRpb25zLmNyb3NzT3JpZ2luLFxuICAgICAgJ29wdGlvbnMnOiBvcHRpb25zXG4gICAgfSk7XG4gIH0sXG4gICdzdG9wVmlkZW9TdHJlYW1pbmcnOiBmdW5jdGlvbiAob2JqKSB7XG4gICAgb2JqID0gdXRpbHMuaXNPYmplY3Qob2JqKSA/IG9iaiA6IHt9O1xuICAgIHZhciBjYW1lcmFTdHJlYW0gPSBvYmouY2FtZXJhU3RyZWFtLCB2aWRlb0VsZW1lbnQgPSBvYmoudmlkZW9FbGVtZW50LCBrZWVwQ2FtZXJhT24gPSBvYmoua2VlcENhbWVyYU9uLCB3ZWJjYW1WaWRlb0VsZW1lbnQgPSBvYmoud2ViY2FtVmlkZW9FbGVtZW50O1xuICAgIGlmICgha2VlcENhbWVyYU9uICYmIGNhbWVyYVN0cmVhbSAmJiB1dGlscy5pc0Z1bmN0aW9uKGNhbWVyYVN0cmVhbS5zdG9wKSkge1xuICAgICAgY2FtZXJhU3RyZWFtLnN0b3AoKTtcbiAgICB9XG4gICAgaWYgKHV0aWxzLmlzRWxlbWVudCh2aWRlb0VsZW1lbnQpICYmICF3ZWJjYW1WaWRlb0VsZW1lbnQpIHtcbiAgICAgIHZpZGVvRWxlbWVudC5wYXVzZSgpO1xuICAgICAgaWYgKHV0aWxzLmlzRnVuY3Rpb24odXRpbHMuVVJMLnJldm9rZU9iamVjdFVSTCkgJiYgIXV0aWxzLndlYldvcmtlckVycm9yKSB7XG4gICAgICAgIGlmICh2aWRlb0VsZW1lbnQuc3JjKSB7XG4gICAgICAgICAgdXRpbHMuVVJMLnJldm9rZU9iamVjdFVSTCh2aWRlb0VsZW1lbnQuc3JjKTtcbiAgICAgICAgfVxuICAgICAgfVxuICAgICAgdXRpbHMucmVtb3ZlRWxlbWVudCh2aWRlb0VsZW1lbnQpO1xuICAgIH1cbiAgfVxufTtcbnN0b3BWaWRlb1N0cmVhbWluZyA9IGZ1bmN0aW9uIChvYmopIHtcbiAgb2JqID0gdXRpbHMuaXNPYmplY3Qob2JqKSA/IG9iaiA6IHt9O1xuICB2YXIgb3B0aW9ucyA9IHV0aWxzLmlzT2JqZWN0KG9iai5vcHRpb25zKSA/IG9iai5vcHRpb25zIDoge30sIGNhbWVyYVN0cmVhbSA9IG9iai5jYW1lcmFTdHJlYW0sIHZpZGVvRWxlbWVudCA9IG9iai52aWRlb0VsZW1lbnQsIHdlYmNhbVZpZGVvRWxlbWVudCA9IG9iai53ZWJjYW1WaWRlb0VsZW1lbnQsIGtlZXBDYW1lcmFPbiA9IG9iai5rZWVwQ2FtZXJhT247XG4gIHZpZGVvU3RyZWFtLnN0b3BWaWRlb1N0cmVhbWluZyh7XG4gICAgJ2NhbWVyYVN0cmVhbSc6IGNhbWVyYVN0cmVhbSxcbiAgICAndmlkZW9FbGVtZW50JzogdmlkZW9FbGVtZW50LFxuICAgICdrZWVwQ2FtZXJhT24nOiBrZWVwQ2FtZXJhT24sXG4gICAgJ3dlYmNhbVZpZGVvRWxlbWVudCc6IHdlYmNhbVZpZGVvRWxlbWVudFxuICB9KTtcbn07XG5jcmVhdGVBbmRHZXRHSUYgPSBmdW5jdGlvbiAob2JqLCBjYWxsYmFjaykge1xuICB2YXIgb3B0aW9ucyA9IG9iai5vcHRpb25zIHx8IHt9LCBpbWFnZXMgPSBvcHRpb25zLmltYWdlcywgdmlkZW8gPSBvcHRpb25zLnZpZGVvLCBudW1GcmFtZXMgPSArb3B0aW9ucy5udW1GcmFtZXMsIGNhbWVyYVN0cmVhbSA9IG9iai5jYW1lcmFTdHJlYW0sIHZpZGVvRWxlbWVudCA9IG9iai52aWRlb0VsZW1lbnQsIHZpZGVvV2lkdGggPSBvYmoudmlkZW9XaWR0aCwgdmlkZW9IZWlnaHQgPSBvYmoudmlkZW9IZWlnaHQsIGdpZldpZHRoID0gK29wdGlvbnMuZ2lmV2lkdGgsIGdpZkhlaWdodCA9ICtvcHRpb25zLmdpZkhlaWdodCwgY3JvcERpbWVuc2lvbnMgPSBzY3JlZW5TaG90LmdldENyb3BEaW1lbnNpb25zKHtcbiAgICAgICd2aWRlb1dpZHRoJzogdmlkZW9XaWR0aCxcbiAgICAgICd2aWRlb0hlaWdodCc6IHZpZGVvSGVpZ2h0LFxuICAgICAgJ2dpZkhlaWdodCc6IGdpZkhlaWdodCxcbiAgICAgICdnaWZXaWR0aCc6IGdpZldpZHRoXG4gICAgfSksIGNvbXBsZXRlQ2FsbGJhY2sgPSBjYWxsYmFjaztcbiAgb3B0aW9ucy5jcm9wID0gY3JvcERpbWVuc2lvbnM7XG4gIG9wdGlvbnMudmlkZW9FbGVtZW50ID0gdmlkZW9FbGVtZW50O1xuICBvcHRpb25zLnZpZGVvV2lkdGggPSB2aWRlb1dpZHRoO1xuICBvcHRpb25zLnZpZGVvSGVpZ2h0ID0gdmlkZW9IZWlnaHQ7XG4gIG9wdGlvbnMuY2FtZXJhU3RyZWFtID0gY2FtZXJhU3RyZWFtO1xuICBpZiAoIXV0aWxzLmlzRWxlbWVudCh2aWRlb0VsZW1lbnQpKSB7XG4gICAgcmV0dXJuO1xuICB9XG4gIHZpZGVvRWxlbWVudC53aWR0aCA9IGdpZldpZHRoICsgY3JvcERpbWVuc2lvbnMud2lkdGg7XG4gIHZpZGVvRWxlbWVudC5oZWlnaHQgPSBnaWZIZWlnaHQgKyBjcm9wRGltZW5zaW9ucy5oZWlnaHQ7XG4gIGlmICghb3B0aW9ucy53ZWJjYW1WaWRlb0VsZW1lbnQpIHtcbiAgICB1dGlscy5zZXRDU1NBdHRyKHZpZGVvRWxlbWVudCwge1xuICAgICAgJ3Bvc2l0aW9uJzogJ2ZpeGVkJyxcbiAgICAgICdvcGFjaXR5JzogJzAnXG4gICAgfSk7XG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZCh2aWRlb0VsZW1lbnQpO1xuICB9XG4gIHZpZGVvRWxlbWVudC5wbGF5KCk7XG4gIHNjcmVlblNob3QuZ2V0R0lGKG9wdGlvbnMsIGZ1bmN0aW9uIChvYmopIHtcbiAgICBpZiAoKCFpbWFnZXMgfHwgIWltYWdlcy5sZW5ndGgpICYmICghdmlkZW8gfHwgIXZpZGVvLmxlbmd0aCkpIHtcbiAgICAgIHN0b3BWaWRlb1N0cmVhbWluZyhvYmopO1xuICAgIH1cbiAgICBjb21wbGV0ZUNhbGxiYWNrKG9iaik7XG4gIH0pO1xufTtcbmV4aXN0aW5nVmlkZW8gPSBmdW5jdGlvbiAob2JqKSB7XG4gIHZhciBleGlzdGluZ1ZpZGVvID0gb2JqLmV4aXN0aW5nVmlkZW8sIGNhbGxiYWNrID0gb2JqLmNhbGxiYWNrLCBvcHRpb25zID0gb2JqLm9wdGlvbnMsIHNraXBPYmogPSB7XG4gICAgICAnZ2V0VXNlck1lZGlhJzogdHJ1ZSxcbiAgICAgICd3aW5kb3cuVVJMJzogdHJ1ZVxuICAgIH0sIGVycm9yT2JqID0gZXJyb3IudmFsaWRhdGUoc2tpcE9iaiksIGxvYWRlZEltYWdlcyA9IDAsIHZpZGVvVHlwZSwgdmlkZW9TcmMsIHRlbXBJbWFnZSwgYWc7XG4gIGlmIChlcnJvck9iai5lcnJvcikge1xuICAgIHJldHVybiBjYWxsYmFjayhlcnJvck9iaik7XG4gIH1cbiAgaWYgKHV0aWxzLmlzRWxlbWVudChleGlzdGluZ1ZpZGVvKSAmJiBleGlzdGluZ1ZpZGVvLnNyYykge1xuICAgIHZpZGVvU3JjID0gZXhpc3RpbmdWaWRlby5zcmM7XG4gICAgdmlkZW9UeXBlID0gdXRpbHMuZ2V0RXh0ZW5zaW9uKHZpZGVvU3JjKTtcbiAgICBpZiAoIXV0aWxzLmlzU3VwcG9ydGVkLnZpZGVvQ29kZWNzW3ZpZGVvVHlwZV0pIHtcbiAgICAgIHJldHVybiBjYWxsYmFjayhlcnJvci5tZXNzYWdlcy52aWRlb0NvZGVjcyk7XG4gICAgfVxuICB9IGVsc2UgaWYgKHV0aWxzLmlzQXJyYXkoZXhpc3RpbmdWaWRlbykpIHtcbiAgICB1dGlscy5lYWNoKGV4aXN0aW5nVmlkZW8sIGZ1bmN0aW9uIChpdGVyYXRvciwgdmlkZW9TcmMpIHtcbiAgICAgIHZpZGVvVHlwZSA9IHZpZGVvU3JjLnN1YnN0cih2aWRlb1NyYy5sYXN0SW5kZXhPZignLicpICsgMSwgdmlkZW9TcmMubGVuZ3RoKTtcbiAgICAgIGlmICh1dGlscy5pc1N1cHBvcnRlZC52aWRlb0NvZGVjc1t2aWRlb1R5cGVdKSB7XG4gICAgICAgIGV4aXN0aW5nVmlkZW8gPSB2aWRlb1NyYztcbiAgICAgICAgcmV0dXJuIGZhbHNlO1xuICAgICAgfVxuICAgIH0pO1xuICB9XG4gIHZpZGVvU3RyZWFtLnN0YXJ0U3RyZWFtaW5nKHtcbiAgICAnY29tcGxldGVkJzogZnVuY3Rpb24gKG9iaikge1xuICAgICAgb2JqLm9wdGlvbnMgPSBvcHRpb25zIHx8IHt9O1xuICAgICAgY3JlYXRlQW5kR2V0R0lGKG9iaiwgY2FsbGJhY2spO1xuICAgIH0sXG4gICAgJ2V4aXN0aW5nVmlkZW8nOiBleGlzdGluZ1ZpZGVvLFxuICAgICdjcm9zc09yaWdpbic6IG9wdGlvbnMuY3Jvc3NPcmlnaW4sXG4gICAgJ29wdGlvbnMnOiBvcHRpb25zXG4gIH0pO1xufTtcbmV4aXN0aW5nV2ViY2FtID0gZnVuY3Rpb24gKG9iaikge1xuICB2YXIgbGFzdENhbWVyYVN0cmVhbSA9IG9iai5sYXN0Q2FtZXJhU3RyZWFtLCBjYWxsYmFjayA9IG9iai5jYWxsYmFjaywgd2ViY2FtVmlkZW9FbGVtZW50ID0gb2JqLndlYmNhbVZpZGVvRWxlbWVudCwgb3B0aW9ucyA9IG9iai5vcHRpb25zO1xuICBpZiAoIWlzV2ViQ2FtR0lGU3VwcG9ydGVkKCkpIHtcbiAgICByZXR1cm4gY2FsbGJhY2soZXJyb3IudmFsaWRhdGUoKSk7XG4gIH1cbiAgaWYgKG9wdGlvbnMuc2F2ZWRSZW5kZXJpbmdDb250ZXh0cy5sZW5ndGgpIHtcbiAgICBzY3JlZW5TaG90LmdldFdlYmNhbUdJRihvcHRpb25zLCBmdW5jdGlvbiAob2JqKSB7XG4gICAgICBjYWxsYmFjayhvYmopO1xuICAgIH0pO1xuICAgIHJldHVybjtcbiAgfVxuICB2aWRlb1N0cmVhbS5zdGFydFZpZGVvU3RyZWFtaW5nKGZ1bmN0aW9uIChvYmopIHtcbiAgICBvYmoub3B0aW9ucyA9IG9wdGlvbnMgfHwge307XG4gICAgY3JlYXRlQW5kR2V0R0lGKG9iaiwgY2FsbGJhY2spO1xuICB9LCB7XG4gICAgJ2xhc3RDYW1lcmFTdHJlYW0nOiBsYXN0Q2FtZXJhU3RyZWFtLFxuICAgICdjYWxsYmFjayc6IGNhbGxiYWNrLFxuICAgICd3ZWJjYW1WaWRlb0VsZW1lbnQnOiB3ZWJjYW1WaWRlb0VsZW1lbnQsXG4gICAgJ2Nyb3NzT3JpZ2luJzogb3B0aW9ucy5jcm9zc09yaWdpblxuICB9KTtcbn07XG5jcmVhdGVHSUYgPSBmdW5jdGlvbiAodXNlck9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIGNhbGxiYWNrID0gdXRpbHMuaXNGdW5jdGlvbih1c2VyT3B0aW9ucykgPyB1c2VyT3B0aW9ucyA6IGNhbGxiYWNrO1xuICB1c2VyT3B0aW9ucyA9IHV0aWxzLmlzT2JqZWN0KHVzZXJPcHRpb25zKSA/IHVzZXJPcHRpb25zIDoge307XG4gIGlmICghdXRpbHMuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG9wdGlvbnMgPSB1dGlscy5tZXJnZU9wdGlvbnMoZGVmYXVsdE9wdGlvbnMsIHVzZXJPcHRpb25zKSB8fCB7fSwgbGFzdENhbWVyYVN0cmVhbSA9IHVzZXJPcHRpb25zLmNhbWVyYVN0cmVhbSwgaW1hZ2VzID0gb3B0aW9ucy5pbWFnZXMsIGltYWdlc0xlbmd0aCA9IGltYWdlcyA/IGltYWdlcy5sZW5ndGggOiAwLCB2aWRlbyA9IG9wdGlvbnMudmlkZW8sIHdlYmNhbVZpZGVvRWxlbWVudCA9IG9wdGlvbnMud2ViY2FtVmlkZW9FbGVtZW50O1xuICBvcHRpb25zID0gdXRpbHMubWVyZ2VPcHRpb25zKG9wdGlvbnMsIHtcbiAgICAnZ2lmV2lkdGgnOiBNYXRoLmZsb29yKG9wdGlvbnMuZ2lmV2lkdGgpLFxuICAgICdnaWZIZWlnaHQnOiBNYXRoLmZsb29yKG9wdGlvbnMuZ2lmSGVpZ2h0KVxuICB9KTtcbiAgaWYgKGltYWdlc0xlbmd0aCkge1xuICAgIGV4aXN0aW5nSW1hZ2VzKHtcbiAgICAgICdpbWFnZXMnOiBpbWFnZXMsXG4gICAgICAnaW1hZ2VzTGVuZ3RoJzogaW1hZ2VzTGVuZ3RoLFxuICAgICAgJ2NhbGxiYWNrJzogY2FsbGJhY2ssXG4gICAgICAnb3B0aW9ucyc6IG9wdGlvbnNcbiAgICB9KTtcbiAgfSBlbHNlIGlmICh2aWRlbykge1xuICAgIGV4aXN0aW5nVmlkZW8oe1xuICAgICAgJ2V4aXN0aW5nVmlkZW8nOiB2aWRlbyxcbiAgICAgICdjYWxsYmFjayc6IGNhbGxiYWNrLFxuICAgICAgJ29wdGlvbnMnOiBvcHRpb25zXG4gICAgfSk7XG4gIH0gZWxzZSB7XG4gICAgZXhpc3RpbmdXZWJjYW0oe1xuICAgICAgJ2xhc3RDYW1lcmFTdHJlYW0nOiBsYXN0Q2FtZXJhU3RyZWFtLFxuICAgICAgJ2NhbGxiYWNrJzogY2FsbGJhY2ssXG4gICAgICAnd2ViY2FtVmlkZW9FbGVtZW50Jzogd2ViY2FtVmlkZW9FbGVtZW50LFxuICAgICAgJ29wdGlvbnMnOiBvcHRpb25zXG4gICAgfSk7XG4gIH1cbn07XG50YWtlU25hcFNob3QgPSBmdW5jdGlvbiAodXNlck9wdGlvbnMsIGNhbGxiYWNrKSB7XG4gIGNhbGxiYWNrID0gdXRpbHMuaXNGdW5jdGlvbih1c2VyT3B0aW9ucykgPyB1c2VyT3B0aW9ucyA6IGNhbGxiYWNrO1xuICB1c2VyT3B0aW9ucyA9IHV0aWxzLmlzT2JqZWN0KHVzZXJPcHRpb25zKSA/IHVzZXJPcHRpb25zIDoge307XG4gIGlmICghdXRpbHMuaXNGdW5jdGlvbihjYWxsYmFjaykpIHtcbiAgICByZXR1cm47XG4gIH1cbiAgdmFyIG1lcmdlZE9wdGlvbnMgPSB1dGlscy5tZXJnZU9wdGlvbnMoZGVmYXVsdE9wdGlvbnMsIHVzZXJPcHRpb25zKSwgb3B0aW9ucyA9IHV0aWxzLm1lcmdlT3B0aW9ucyhtZXJnZWRPcHRpb25zLCB7XG4gICAgICAnaW50ZXJ2YWwnOiAwLjEsXG4gICAgICAnbnVtRnJhbWVzJzogMSxcbiAgICAgICdnaWZXaWR0aCc6IE1hdGguZmxvb3IobWVyZ2VkT3B0aW9ucy5naWZXaWR0aCksXG4gICAgICAnZ2lmSGVpZ2h0JzogTWF0aC5mbG9vcihtZXJnZWRPcHRpb25zLmdpZkhlaWdodClcbiAgICB9KTtcbiAgY3JlYXRlR0lGKG9wdGlvbnMsIGNhbGxiYWNrKTtcbn07XG5BUEkgPSBmdW5jdGlvbiAodXRpbHMsIGVycm9yLCBkZWZhdWx0T3B0aW9ucywgaXNTdXBwb3J0ZWQsIGlzV2ViQ2FtR0lGU3VwcG9ydGVkLCBpc0V4aXN0aW5nSW1hZ2VzR0lGU3VwcG9ydGVkLCBpc0V4aXN0aW5nVmlkZW9HSUZTdXBwb3J0ZWQsIGNyZWF0ZUdJRiwgdGFrZVNuYXBTaG90LCBzdG9wVmlkZW9TdHJlYW1pbmcpIHtcbiAgdmFyIGdpZnNob3QgPSB7XG4gICAgJ3V0aWxzJzogdXRpbHMsXG4gICAgJ2Vycm9yJzogZXJyb3IsXG4gICAgJ2RlZmF1bHRPcHRpb25zJzogZGVmYXVsdE9wdGlvbnMsXG4gICAgJ2NyZWF0ZUdJRic6IGNyZWF0ZUdJRixcbiAgICAndGFrZVNuYXBTaG90JzogdGFrZVNuYXBTaG90LFxuICAgICdzdG9wVmlkZW9TdHJlYW1pbmcnOiBzdG9wVmlkZW9TdHJlYW1pbmcsXG4gICAgJ2lzU3VwcG9ydGVkJzogaXNTdXBwb3J0ZWQsXG4gICAgJ2lzV2ViQ2FtR0lGU3VwcG9ydGVkJzogaXNXZWJDYW1HSUZTdXBwb3J0ZWQsXG4gICAgJ2lzRXhpc3RpbmdWaWRlb0dJRlN1cHBvcnRlZCc6IGlzRXhpc3RpbmdWaWRlb0dJRlN1cHBvcnRlZCxcbiAgICAnaXNFeGlzdGluZ0ltYWdlc0dJRlN1cHBvcnRlZCc6IGlzRXhpc3RpbmdJbWFnZXNHSUZTdXBwb3J0ZWQsXG4gICAgJ1ZFUlNJT04nOiAnMC4zLjInXG4gIH07XG4gIHJldHVybiBnaWZzaG90O1xufSh1dGlscywgZXJyb3IsIGRlZmF1bHRPcHRpb25zLCBpc1N1cHBvcnRlZCwgaXNXZWJDYW1HSUZTdXBwb3J0ZWQsIGlzRXhpc3RpbmdJbWFnZXNHSUZTdXBwb3J0ZWQsIGlzRXhpc3RpbmdWaWRlb0dJRlN1cHBvcnRlZCwgY3JlYXRlR0lGLCB0YWtlU25hcFNob3QsIHN0b3BWaWRlb1N0cmVhbWluZyk7XG4oZnVuY3Rpb24gKEFQSSkge1xuICBpZiAodHlwZW9mIGRlZmluZSA9PT0gJ2Z1bmN0aW9uJyAmJiBkZWZpbmUuYW1kKSB7XG4gICAgZGVmaW5lKFtdLCBmdW5jdGlvbiAoKSB7XG4gICAgICByZXR1cm4gQVBJO1xuICAgIH0pO1xuICB9IGVsc2UgaWYgKHR5cGVvZiBleHBvcnRzICE9PSAndW5kZWZpbmVkJykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gQVBJO1xuICB9IGVsc2Uge1xuICAgIHdpbmRvdy5naWZzaG90ID0gQVBJO1xuICB9XG59KEFQSSkpO1xufSh0eXBlb2Ygd2luZG93ICE9PSBcInVuZGVmaW5lZFwiID8gd2luZG93IDoge30sIHR5cGVvZiBkb2N1bWVudCAhPT0gXCJ1bmRlZmluZWRcIiA/IGRvY3VtZW50IDogeyBjcmVhdGVFbGVtZW50OiBmdW5jdGlvbigpIHt9IH0sIHR5cGVvZiB3aW5kb3cgIT09IFwidW5kZWZpbmVkXCIgPyB3aW5kb3cubmF2aWdhdG9yIDoge30pKTsiLCJ2YXIgbm93ID0gcmVxdWlyZSgncGVyZm9ybWFuY2Utbm93JylcbiAgLCBnbG9iYWwgPSB0eXBlb2Ygd2luZG93ID09PSAndW5kZWZpbmVkJyA/IHt9IDogd2luZG93XG4gICwgdmVuZG9ycyA9IFsnbW96JywgJ3dlYmtpdCddXG4gICwgc3VmZml4ID0gJ0FuaW1hdGlvbkZyYW1lJ1xuICAsIHJhZiA9IGdsb2JhbFsncmVxdWVzdCcgKyBzdWZmaXhdXG4gICwgY2FmID0gZ2xvYmFsWydjYW5jZWwnICsgc3VmZml4XSB8fCBnbG9iYWxbJ2NhbmNlbFJlcXVlc3QnICsgc3VmZml4XVxuXG5mb3IodmFyIGkgPSAwOyBpIDwgdmVuZG9ycy5sZW5ndGggJiYgIXJhZjsgaSsrKSB7XG4gIHJhZiA9IGdsb2JhbFt2ZW5kb3JzW2ldICsgJ1JlcXVlc3QnICsgc3VmZml4XVxuICBjYWYgPSBnbG9iYWxbdmVuZG9yc1tpXSArICdDYW5jZWwnICsgc3VmZml4XVxuICAgICAgfHwgZ2xvYmFsW3ZlbmRvcnNbaV0gKyAnQ2FuY2VsUmVxdWVzdCcgKyBzdWZmaXhdXG59XG5cbi8vIFNvbWUgdmVyc2lvbnMgb2YgRkYgaGF2ZSByQUYgYnV0IG5vdCBjQUZcbmlmKCFyYWYgfHwgIWNhZikge1xuICB2YXIgbGFzdCA9IDBcbiAgICAsIGlkID0gMFxuICAgICwgcXVldWUgPSBbXVxuICAgICwgZnJhbWVEdXJhdGlvbiA9IDEwMDAgLyA2MFxuXG4gIHJhZiA9IGZ1bmN0aW9uKGNhbGxiYWNrKSB7XG4gICAgaWYocXVldWUubGVuZ3RoID09PSAwKSB7XG4gICAgICB2YXIgX25vdyA9IG5vdygpXG4gICAgICAgICwgbmV4dCA9IE1hdGgubWF4KDAsIGZyYW1lRHVyYXRpb24gLSAoX25vdyAtIGxhc3QpKVxuICAgICAgbGFzdCA9IG5leHQgKyBfbm93XG4gICAgICBzZXRUaW1lb3V0KGZ1bmN0aW9uKCkge1xuICAgICAgICB2YXIgY3AgPSBxdWV1ZS5zbGljZSgwKVxuICAgICAgICAvLyBDbGVhciBxdWV1ZSBoZXJlIHRvIHByZXZlbnRcbiAgICAgICAgLy8gY2FsbGJhY2tzIGZyb20gYXBwZW5kaW5nIGxpc3RlbmVyc1xuICAgICAgICAvLyB0byB0aGUgY3VycmVudCBmcmFtZSdzIHF1ZXVlXG4gICAgICAgIHF1ZXVlLmxlbmd0aCA9IDBcbiAgICAgICAgZm9yKHZhciBpID0gMDsgaSA8IGNwLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgaWYoIWNwW2ldLmNhbmNlbGxlZCkge1xuICAgICAgICAgICAgdHJ5e1xuICAgICAgICAgICAgICBjcFtpXS5jYWxsYmFjayhsYXN0KVxuICAgICAgICAgICAgfSBjYXRjaChlKSB7XG4gICAgICAgICAgICAgIHNldFRpbWVvdXQoZnVuY3Rpb24oKSB7IHRocm93IGUgfSwgMClcbiAgICAgICAgICAgIH1cbiAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgIH0sIE1hdGgucm91bmQobmV4dCkpXG4gICAgfVxuICAgIHF1ZXVlLnB1c2goe1xuICAgICAgaGFuZGxlOiArK2lkLFxuICAgICAgY2FsbGJhY2s6IGNhbGxiYWNrLFxuICAgICAgY2FuY2VsbGVkOiBmYWxzZVxuICAgIH0pXG4gICAgcmV0dXJuIGlkXG4gIH1cblxuICBjYWYgPSBmdW5jdGlvbihoYW5kbGUpIHtcbiAgICBmb3IodmFyIGkgPSAwOyBpIDwgcXVldWUubGVuZ3RoOyBpKyspIHtcbiAgICAgIGlmKHF1ZXVlW2ldLmhhbmRsZSA9PT0gaGFuZGxlKSB7XG4gICAgICAgIHF1ZXVlW2ldLmNhbmNlbGxlZCA9IHRydWVcbiAgICAgIH1cbiAgICB9XG4gIH1cbn1cblxubW9kdWxlLmV4cG9ydHMgPSBmdW5jdGlvbihmbikge1xuICAvLyBXcmFwIGluIGEgbmV3IGZ1bmN0aW9uIHRvIHByZXZlbnRcbiAgLy8gYGNhbmNlbGAgcG90ZW50aWFsbHkgYmVpbmcgYXNzaWduZWRcbiAgLy8gdG8gdGhlIG5hdGl2ZSByQUYgZnVuY3Rpb25cbiAgcmV0dXJuIHJhZi5jYWxsKGdsb2JhbCwgZm4pXG59XG5tb2R1bGUuZXhwb3J0cy5jYW5jZWwgPSBmdW5jdGlvbigpIHtcbiAgY2FmLmFwcGx5KGdsb2JhbCwgYXJndW1lbnRzKVxufVxuIiwiLy8gR2VuZXJhdGVkIGJ5IENvZmZlZVNjcmlwdCAxLjcuMVxuKGZ1bmN0aW9uKCkge1xuICB2YXIgZ2V0TmFub1NlY29uZHMsIGhydGltZSwgbG9hZFRpbWU7XG5cbiAgaWYgKCh0eXBlb2YgcGVyZm9ybWFuY2UgIT09IFwidW5kZWZpbmVkXCIgJiYgcGVyZm9ybWFuY2UgIT09IG51bGwpICYmIHBlcmZvcm1hbmNlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gcGVyZm9ybWFuY2Uubm93KCk7XG4gICAgfTtcbiAgfSBlbHNlIGlmICgodHlwZW9mIHByb2Nlc3MgIT09IFwidW5kZWZpbmVkXCIgJiYgcHJvY2VzcyAhPT0gbnVsbCkgJiYgcHJvY2Vzcy5ocnRpbWUpIHtcbiAgICBtb2R1bGUuZXhwb3J0cyA9IGZ1bmN0aW9uKCkge1xuICAgICAgcmV0dXJuIChnZXROYW5vU2Vjb25kcygpIC0gbG9hZFRpbWUpIC8gMWU2O1xuICAgIH07XG4gICAgaHJ0aW1lID0gcHJvY2Vzcy5ocnRpbWU7XG4gICAgZ2V0TmFub1NlY29uZHMgPSBmdW5jdGlvbigpIHtcbiAgICAgIHZhciBocjtcbiAgICAgIGhyID0gaHJ0aW1lKCk7XG4gICAgICByZXR1cm4gaHJbMF0gKiAxZTkgKyBoclsxXTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gZ2V0TmFub1NlY29uZHMoKTtcbiAgfSBlbHNlIGlmIChEYXRlLm5vdykge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gRGF0ZS5ub3coKSAtIGxvYWRUaW1lO1xuICAgIH07XG4gICAgbG9hZFRpbWUgPSBEYXRlLm5vdygpO1xuICB9IGVsc2Uge1xuICAgIG1vZHVsZS5leHBvcnRzID0gZnVuY3Rpb24oKSB7XG4gICAgICByZXR1cm4gbmV3IERhdGUoKS5nZXRUaW1lKCkgLSBsb2FkVGltZTtcbiAgICB9O1xuICAgIGxvYWRUaW1lID0gbmV3IERhdGUoKS5nZXRUaW1lKCk7XG4gIH1cblxufSkuY2FsbCh0aGlzKTtcbiIsImltcG9ydCBhc3NpZ24gZnJvbSAnYXNzaWdubWVudCdcbmltcG9ydCByYWYgZnJvbSAncmFmJ1xuaW1wb3J0IGNvbXB1dGVkU3R5bGUgZnJvbSAnY29tcHV0ZWQtc3R5bGUnXG5pbXBvcnQgZ2lmc2hvdCBmcm9tICdnaWZzaG90J1xuXG5mdW5jdGlvbiB2ZWN0b3JjYW0gKHN2Zywgb3B0aW9ucz17fSkge1xuICB2YXIgcHJvcHMgPSBbIC8vIGNvcGllZCBmcm9tIGNsYXNzZXMgdGhyb3VnaCBjb21wdXRlZC1zdHlsZVxuICAgICdiYWNrZ3JvdW5kLWNvbG9yJyxcbiAgICAnY29sb3InLFxuICAgICdkb21pbmFudC1iYXNlbGluZScsXG4gICAgJ2ZpbGwnLFxuICAgICdmb250LWZhbWlseScsXG4gICAgJ2ZvbnQtc2l6ZScsXG4gICAgJ29wYWNpdHknLFxuICAgICdyJyxcbiAgICAnc3Ryb2tlJyxcbiAgICAnc3Ryb2tlLWRhc2hhcnJheScsXG4gICAgJ3N0cm9rZS13aWR0aCcsXG4gICAgJ3RleHQtYW5jaG9yJ1xuICBdXG4gIHZhciBkZWZhdWx0cyA9IHtcbiAgICBmcHM6IDRcbiAgfVxuICB2YXIgbyA9IGFzc2lnbih7fSwgZGVmYXVsdHMsIG9wdGlvbnMpXG4gIHZhciBmcmFtZXMgPSBbXVxuICB2YXIgcmVjb3JkaW5nID0gZmFsc2VcbiAgdmFyIGxhc3RDYXB0dXJlID0gLUluZmluaXR5XG4gIHZhciBjYXB0dXJlSW50ZXJ2YWwgPSAxMDAwIC8gby5mcHNcbiAgdmFyIGNhbSA9IHtcbiAgICBnZXQgZnJhbWVzICgpIHsgcmV0dXJuIFsuLi5mcmFtZXNdIH0sXG4gICAgZ2V0IHJlY29yZGluZyAoKSB7IHJldHVybiByZWNvcmRpbmcgfSxcbiAgICBzdGFydCAoKSB7XG4gICAgICBjYW0ucmVzZXQoKVxuICAgICAgcmVjb3JkaW5nID0gdHJ1ZVxuICAgICAgcmFmKHJlY29yZClcbiAgICAgIHJldHVybiBjYW1cbiAgICB9LFxuICAgIHN0b3AgKGRvbmUpIHtcbiAgICAgIHZhciByZWN0ID0gc3ZnLmdldEJvdW5kaW5nQ2xpZW50UmVjdCgpXG4gICAgICB2YXIgd2lkdGggPSByZWN0LndpZHRoXG4gICAgICB2YXIgaGVpZ2h0ID0gcmVjdC5oZWlnaHRcblxuICAgICAgcmVjb3JkaW5nID0gZmFsc2VcbiAgICAgIGZyYW1lcyA9IGZyYW1lcy5tYXAoZiA9PiBmIC8vIHJlc2l6ZSBhbGwgZnJhbWVzIHRvIGZpbmFsIHdpZHRoIGFuZCBoZWlnaHRcbiAgICAgICAgLnJlcGxhY2UoL3dpZHRoPVwiXFxkK1wiLywgYHdpZHRoPVwiJHt3aWR0aH1cImApXG4gICAgICAgIC5yZXBsYWNlKC9oZWlnaHQ9XCJcXGQrXCIvLCBgaGVpZ2h0PVwiJHtoZWlnaHR9XCJgKVxuICAgICAgKVxuXG4gICAgICBpZiAoIWRvbmUpIHtcbiAgICAgICAgcmV0dXJuXG4gICAgICB9XG4gICAgICB2YXIgb3B0aW9ucyA9IHtcbiAgICAgICAgaW1hZ2VzOiBmcmFtZXMsXG4gICAgICAgIGdpZldpZHRoOiB3aWR0aCxcbiAgICAgICAgZ2lmSGVpZ2h0OiBoZWlnaHRcbiAgICAgIH1cbiAgICAgIGdpZnNob3QuY3JlYXRlR0lGKG9wdGlvbnMsIHJlcyA9PiBkb25lKHJlcy5lcnJvciwgcmVzLmltYWdlKSlcbiAgICAgIHJldHVybiBjYW1cbiAgICB9LFxuICAgIGFkZCAoZnJhbWUpIHtcbiAgICAgIGZyYW1lcy5wdXNoKGZyYW1lKVxuICAgIH0sXG4gICAgc25hcCxcbiAgICByZXNldCAoKSB7XG4gICAgICBmcmFtZXMgPSBbXVxuICAgICAgY2FtLnBhdXNlKClcbiAgICAgIHJldHVybiBjYW1cbiAgICB9LFxuICAgIHBhdXNlICgpIHtcbiAgICAgIHJlY29yZGluZyA9IGZhbHNlXG4gICAgICByZXR1cm4gY2FtXG4gICAgfSxcbiAgICByZXN1bWUgKCkge1xuICAgICAgcmVjb3JkaW5nID0gdHJ1ZVxuICAgICAgcmV0dXJuIGNhbVxuICAgIH1cbiAgfVxuXG4gIHJldHVybiBjYW1cblxuICBmdW5jdGlvbiByZWNvcmQgKGRpZmYpIHtcbiAgICBpZiAoZGlmZiAtIGxhc3RDYXB0dXJlID4gY2FwdHVyZUludGVydmFsKSB7XG4gICAgICBsYXN0Q2FwdHVyZSA9IGRpZmZcbiAgICAgIHNuYXAoKVxuICAgIH1cbiAgICBpZiAocmVjb3JkaW5nKSB7XG4gICAgICByYWYocmVjb3JkKVxuICAgIH1cbiAgfVxuXG4gIGZ1bmN0aW9uIHNuYXAgKCkge1xuICAgIHZhciBtaXJyb3IgPSBzdmcuY2xvbmVOb2RlKHRydWUpXG4gICAgZG9jdW1lbnQuYm9keS5hcHBlbmRDaGlsZChtaXJyb3IpO1xuICAgIFsuLi5taXJyb3IucXVlcnlTZWxlY3RvckFsbCgnKicpXS5mb3JFYWNoKGVsID0+IHtcbiAgICAgIHByb3BzLmZvckVhY2gocHJvcCA9PiBlbC5zdHlsZVtwcm9wXSA9IGNvbXB1dGVkU3R5bGUoZWwsIHByb3ApKVxuICAgIH0pXG4gICAgdmFyIHNlcmlhbGl6ZWQgPSBuZXcgWE1MU2VyaWFsaXplcigpLnNlcmlhbGl6ZVRvU3RyaW5nKG1pcnJvcilcbiAgICBjYW0uYWRkKCdkYXRhOmltYWdlL3N2Zyt4bWw7dXRmOCwnICsgc2VyaWFsaXplZClcbiAgICBkb2N1bWVudC5ib2R5LnJlbW92ZUNoaWxkKG1pcnJvcilcbiAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCB2ZWN0b3JjYW1cbiJdfQ==
