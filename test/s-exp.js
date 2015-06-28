/*global describe:false, before:false, after:false, it:false*/
'use strict';

var assert = require('assert'),
    parse = require('../lib/parse'),
    S = require('../lib/S');

describe('S expression constructor', function () {

  it('should pass through error occuring in parse phase', function () {
    assert.throws(
      function() {
	s = S.create('(; 1)');
      },
	Error
    );
  });

  it('should validate atom', function () {
    var s = S.create('(set000! x (< a b))');
    assert.strictEqual(S.car(s), 'set000!');
    assert.strictEqual(S.cadr(s), 'x');
    assert.strictEqual(S.caaddr(s), '<');
    assert.strictEqual(S.cadaddr(s), 'a');
    assert.strictEqual(S.caddaddr(s), 'b');

    s = S.create('(1a b)');
    assert.strictEqual(S.car(s), 1);
    assert.strictEqual(S.cadr(s), 'b');

    assert.throws(
      function() {
	s = S.create('(, 1)');
      },
	Error
    );
  });

  it('should create flat S expression', function () {
    var s = S.create('(+ 1 2 3)');

    assert.strictEqual(S.car(s), '+');
    assert.strictEqual(S.cadr(s), 1);
    assert.strictEqual(S.caddr(s), 2);
    assert.strictEqual(S.cadddr(s), 3);
    assert.strictEqual(S.cddddr(s), null);
  });

  it('should create nested S expression', function () {
    var s = S.create('(+ (* a 2) (- b 1))');

    assert.strictEqual(S.car(s), '+');
    assert.strictEqual(S.caadr(s), '*');
    assert.strictEqual(S.cadadr(s), 'a');
    assert.strictEqual(S.cdddadr(s), null);
    assert.strictEqual(S.caaddr(s), '-');
    assert.strictEqual(S.cdddr(s), null);
  });

  it('should skip spaces', function () {
    var s = S.create(' ( +   (  *    a  2  ) 2    )');

    assert.strictEqual(S.car(s), '+');
    assert.strictEqual(S.caadr(s), '*');
    assert.strictEqual(S.cadadr(s), 'a');
    assert.strictEqual(S.cdddadr(s), null);
    assert.strictEqual(S.caddr(s), 2);
    assert.strictEqual(S.cdddr(s), null);
  });

  it('should create value', function () {
    var s = S.create(parse('1'));

    assert.strictEqual(s, 1);
  });

  it('should create string', function () {
    var s = S.create('(error "unexpected error")');

    assert.strictEqual(S.car(s), 'error');
    assert.strictEqual(S.cadr(s), '"unexpected error"');
  });

  it('should create boolean', function () {
    var s = S.create('(= a #t)');
    assert.strictEqual(S.car(s), '=');
    assert.strictEqual(S.cadr(s), 'a');
    assert.strictEqual(S.caddr(s), true);
    assert.strictEqual(S.cdddr(s), null);
  });

  it('should skip single line comment', function () {
    var s = S.create(' ( + (  * a  2  ) ; doubled\n2)');

    assert.strictEqual(S.caddr(s), 2);
    assert.strictEqual(S.cdddr(s), null);
  });

  it('should create S expression with dotted list', function () {

    var s = S.create(' (a . b)');
    assert.strictEqual(S.car(s), 'a');
    assert.strictEqual(S.cdr(s), 'b');

    s = S.create('((a . b) . (c d))');
    assert.strictEqual(S.caar(s), 'a');
    assert.strictEqual(S.cdar(s), 'b');
    assert.strictEqual(S.cadr(s), 'c');
    assert.strictEqual(S.caddr(s), 'd');

    assert.throws(
      function() {
	s = S.create('(a . b c)');
      },
	Error
    );

    assert.throws(
      function() {
	s = S.create('(. a)');
      },
	Error
    );

  });

  it('should create S expression with quote', function () {
    var s = S.create('\'(a b)');

    assert.strictEqual(S.car(s), 'quote');
    assert.strictEqual(S.caadr(s), 'a');
    assert.strictEqual(S.cadadr(s), 'b');
    assert.strictEqual(S.cddadr(s), null);
    assert.strictEqual(S.cddr(s), null);

    s = S.create('(list \'a 1)');
    assert.strictEqual(S.car(s), 'list');
    assert.strictEqual(S.caadr(s), 'quote');
    assert.strictEqual(S.cadadr(s), 'a');
    assert.strictEqual(S.caddr(s), 1);
    assert.strictEqual(S.cdddr(s), null);
  });
});