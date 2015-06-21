'use strict';

function evalScheme(src) {
  return src;
}

var SchemeInterpreter = {
  eval: evalScheme
};

module.exports = SchemeInterpreter;