/*global describe:false, before:false, after:false, it:false*/
'use strict';

var assert = require('assert'),
    parse = require('../lib/parse'),
    S = require('../lib/S');

describe('S expression', function () {

  describe('parser', function() {
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
    
    it('should parse empty list as null', function () {
      var s = S.create('()');
      assert.strictEqual(s, null);
    });
  });

  describe('utility', function() {
    it('car should throw error when evaluating null', function() {
      assert.throws(function() {
	var s = S.create('()');
	S.car(s);
      }, Error);
    });

    it('cdr should throw error when evaluating null', function() {
      assert.throws(function() {
	var s = S.create('()');
	S.cdr(s);
      }, Error);
    });

    it('null test should validate null', function () {
      var s = S.create('()');
      assert.ok(S.isNull(s));

      s = S.create('(1)');
      assert.ok(!S.isNull(s));
      assert.ok(S.isNull(S.cdr(s)));
    });

    it('pair test should validate pair', function () {
      var s = S.create('(1)');
      assert.ok(S.isPair(s));

      s = S.create('1');
      assert.ok(!S.isNull(s));
    });

    it('string test should validate pair', function () {
      var s = S.create('(error "error message")');
      assert.ok(!S.isString(s));
      assert.ok(S.isString(S.cadr(s)));

      s = S.create('\'(a b)');
      assert.ok(!S.isString(s));
    });

    it('number test should validate number', function () {
      var s = S.create('(1)');
      assert.ok(!S.isNumber(s));
      assert.ok(S.isNumber(S.car(s)));
    });

    it('symbol test should validate number', function () {
      var s = S.create('\'a');
      assert.ok(S.isSymbol(s));

      s = S.create('\'abc');
      assert.ok(S.isSymbol(s));

      s = S.create('\'!');
      assert.ok(S.isSymbol(s));

      s = S.create('\'1');
      assert.ok(!S.isSymbol(s));

      s = S.create('\'#t');
      assert.ok(!S.isSymbol(s));

      s = S.create('\'"abc"');
      assert.ok(!S.isSymbol(s));

      s = S.create('\'(a b)');
      assert.ok(!S.isSymbol(s));
    });

    it('symbol should pull symbol literal', function () {
      var s = S.create('\'a');
      assert.strictEqual(S.symbol(s), 'a');

      s = S.create('\'abc');
      assert.strictEqual(S.symbol(s), 'abc');

      s = S.create('\'!');
      assert.strictEqual(S.symbol(s), '!');
    });

    it('should show S exp in string form', function () {
      var s = S.create('a');
      assert.strictEqual(S.toString(s), 'a');

      s = S.create('(a b (c d))');
      assert.strictEqual(S.toString(s), '(a b (c d))');

      s = S.create('(error "abc def")');
      assert.strictEqual(S.toString(s), '(error "abc def")');

      s = S.create('(eq? x #t)');
      assert.strictEqual(S.toString(s), '(eq? x true)');

      s = S.create('\'(a 1)');
      assert.strictEqual(S.toString(s), '\'(a 1)');

      s = S.create('(a b . 1)');
      assert.strictEqual(S.toString(s), '(a b . 1)');
    });

    it('should create list by cons', function () {
      var s = S.cons('a');
      assert.deepEqual(s, S.create('(a)'));

      s = S.cons('a', S.cons('b'));
      assert.deepEqual(s, S.create('(a b)'));
    });

    it('should create list from argument', function () {
      var s = S.list('a');
      assert.deepEqual(s, S.create('(a)'));

      s = S.list('a', 'b', 'c');
      assert.deepEqual(s, S.create('(a b c)'));
    });

    it('should map list ', function () {
      var s = S.list(1, 2, 3);
      var mapped = S.map(s, function(x) { return x+1; });
      assert.deepEqual(mapped, S.create('(2 3 4)'));
    });
  });

});