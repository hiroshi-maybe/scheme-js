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

  it('should parse value without list', function () {
    var tokens = parse('1');
    assert.deepEqual(tokens, '1');
  });

  it('should parse string', function () {
    var tokens = parse('(error "unexpected error")');
    assert.deepEqual(tokens, ['error', '"unexpected error"']);
  });

  it('should parse line break as space', function () {
    var tokens, src = '(define (fact n)\n(if (= n 0) 1\n\t(* n (fact (- n 1)))))';

    tokens = parse(src);
    assert.deepEqual(tokens, ['define', ['fact', 'n'], ['if', ['=','n','0'], '1', ['*', 'n', ['fact', ['-', 'n', '1']]]]]);
  });

  it('should skip single line comment', function () {
    var tokens = parse(' ( + (  * a  2  ) ; doubled\n2)');
    assert.deepEqual(tokens, ['+', ['*', 'a', '2'], '2']);
  });
});