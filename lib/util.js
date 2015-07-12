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

var Util = {
  error: error,
  replaceAll: replaceAll,
  toArray: toArray
};

module.exports = Util;