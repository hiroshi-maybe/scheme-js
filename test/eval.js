/*global describe:false, before:false, after:false, it:false*/
'use strict';

var assert = require('assert'),
    SchemeInterpreter = require('..');

describe('process', function () {

  it('should replace `pre` tag by handler', function () {
    var src = '(list 1 2 3)';
    assert.strictEqual(src, SchemeInterpreter.eval(src));
  });
});