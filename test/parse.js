/*global describe:false, before:false, after:false, it:false*/
'use strict';

var assert = require('assert'),
    parse = require('../lib/parse');

describe('parser', function () {

  it('should parse flat S expression', function () {
    var tokens = parse('(+ 1 2 3)');
    assert.deepEqual(tokens, ['+', '1', '2', '3']);
  });
});