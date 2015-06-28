/*global describe:false, before:false, after:false, it:false*/
'use strict';

var assert = require('assert'),
    parse = require('../lib/parse'),
    S = require('../lib/S');

describe('S expression constructor', function () {

  it('should create flat S expression', function () {
    var tokens = parse('(+ 1 2 3)'),
        s = S.create(tokens);

    assert.strictEqual(S.car(s), '+');
    assert.strictEqual(S.cadr(s), 1);
    assert.strictEqual(S.caddr(s), 2);
    assert.strictEqual(S.cadddr(s), 3);
    assert.strictEqual(S.cddddr(s), null);

    tokens = parse('(= a #t)');
    s = S.create(tokens);
    assert.strictEqual(S.car(s), '=');
    assert.strictEqual(S.cadr(s), 'a');
    assert.strictEqual(S.caddr(s), true);
    assert.strictEqual(S.cdddr(s), null);
  });

  it('should create nested S expression', function () {
    var tokens = parse('(+ (* a 2) (- b 1))'),
        s = S.create(tokens);
    assert.strictEqual(S.car(s), '+');
    assert.strictEqual(S.caadr(s), '*');
    assert.strictEqual(S.cadadr(s), 'a');
    assert.strictEqual(S.cdddadr(s), null);
    assert.strictEqual(S.caaddr(s), '-');
    assert.strictEqual(S.cdddr(s), null);
  });

  it('should skip spaces', function () {
    var tokens = parse(' ( +   (  *    a  2  ) 2    )'),
        s = S.create(tokens);
    assert.strictEqual(S.car(s), '+');
    assert.strictEqual(S.caadr(s), '*');
    assert.strictEqual(S.cadadr(s), 'a');
    assert.strictEqual(S.cdddadr(s), null);
    assert.strictEqual(S.caddr(s), 2);
    assert.strictEqual(S.cdddr(s), null);
  });

  it('should create value', function () {
    var tokens = parse('1'),
        s = S.create(tokens);
    assert.strictEqual(s, 1);
  });

  it('should create string', function () {
    var tokens = parse('(error "unexpected error")'),
        s = S.create(tokens);
    assert.strictEqual(S.car(s), 'error');
    assert.strictEqual(S.cadr(s), 'unexpected error');
  });

  it('should skip single line comment', function () {
    var tokens = parse(' ( + (  * a  2  ) ; doubled\n2)'),
        s = S.create(tokens);
    assert.strictEqual(S.caddr(s), 2);
    assert.strictEqual(S.cdddr(s), null);
  });

  it('should create S expression with dotted list', function () {
    var tokens = parse(' (a . b)');
    assert.deepEqual(tokens, ['a', '.', 'b']);
  });

  it('should create S expression with quote', function () {
    var tokens = parse('\'(a b)'),
        s = S.create(tokens);
    assert.strictEqual(S.car(s), 'quote');
    assert.strictEqual(S.caadr(s), 'a');
    assert.strictEqual(S.cadadr(s), 'b');
    assert.strictEqual(S.cddadr(s), null);
    assert.strictEqual(S.cddr(s), null);

    tokens = parse('(list \'a 1)');
    s = S.create(tokens);
    assert.strictEqual(S.car(s), 'list');
    assert.strictEqual(S.caadr(s), 'quote');
    assert.strictEqual(S.cadadr(s), 'a');
    assert.strictEqual(S.caddr(s), 1);
    assert.strictEqual(S.cdddr(s), null);
  });
});