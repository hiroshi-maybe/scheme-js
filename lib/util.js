'use strict';

/**
 * Error handling helper
 */
function error(message) {
  console.error(message);
  throw new Error(message);
}

// http://stackoverflow.com/questions/1144783/replacing-all-occurrences-of-a-string-in-javascript
function escapeRegExp(string) { 
  return string.replace(/([.*+?^=!:${}()|\[\]\/\\])/g, "\\$1");
}
function replaceAll(string, find, replace) { 
  return string.replace(new RegExp(escapeRegExp(find), 'g'), replace);
}

// create array from array-like object
function toArray(looksArray) {
  return Array.prototype.slice.call(looksArray);
}

function merge(dest, src) {
  return Object.keys(src).reduce(function(dest, key) {
    dest[key] = src[key];
    return dest;
  }, dest);
}
function extend(dest) {
  var objs = toArray(arguments).slice(1);
  return objs.reduce(merge, dest);
}

function objMap(obj, mapper) {
  return Object.keys(obj).reduce(function(newObj, key){
    newObj[key] = mapper(obj[key]) ;
    return newObj;
  }, {});
}

var Util = {
  error: error,
  replaceAll: replaceAll,
  toArray: toArray,
  extend: extend,
  objMap: objMap
};

module.exports = Util;