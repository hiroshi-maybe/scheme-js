'use strict';

/**
 * Error handling helper
 */
function error(message) {
  console.error(message);
  throw new Error(message);
}

var Util = {
  error: error
};

module.exports = Util;