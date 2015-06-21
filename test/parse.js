/*global describe:false, before:false, after:false, it:false*/
'use strict';

var assert = require('assert'),
    parse = require('../lib/parse');

describe('parser', function () {

  it('should parse flat S expression', function () {
    var tokens = parse('(+ 1 2 3)');
    assert.deepEqual(tokens, ['+', '1', '2', '3']);
  });

  it('should parse nested S expression', function () {
    var tokens = parse('(+ (* a 2) (- b 1))');
    assert.deepEqual(tokens, ['+', ['*', 'a', '2'], ['-', 'b', '1']]);
  });

  it('should throw error if S expression is broken', function () {
    assert.throws(
      function() {
	parse('(+ (* a 2) (- b 1)');
      },
	Error
    );
  });

  it('should skip spaces', function () {
    var tokens = parse(' ( +   (  *    a  2  ) 2    )');
    assert.deepEqual(tokens, ['+', ['*', 'a', '2'], '2']);
  });
});