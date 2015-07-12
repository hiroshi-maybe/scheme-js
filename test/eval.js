/*global describe:false, before:false, after:false, it:false*/
'use strict';

var assert = require('assert'),
    scm_eval = require('../lib/eval'),
    Env = require('../lib/env'),
    S = require('../lib/S');

describe('Scheme', function () {
  describe('evaluator', function() {
    it('should evaluate definition', function () {
      var env = Env.setup();
      scm_eval('(define x 1)', env);
      assert.strictEqual(env.lookupVar('x'), 1);
    });

    it('should evaluate definition (lambda)', function () {
      var env = Env.setup(), res;
      scm_eval('(define (add a b) (+ a b))', env);
      res = env.lookupVar('add');

      assert.strictEqual(S.car(res), 'procedure');
      assert.deepEqual(S.cadr(res), S.list('a', 'b'));
      assert.deepEqual(S.caaddr(res), S.list('+', 'a', 'b'));
      assert.strictEqual(S.cadddr(res), env);
    });

    it('should evaluate if', function () {
      var res,
          env = Env.setup();
      res = scm_eval('(if #t 100 -1)', env);
      assert.strictEqual(res, 100);
    });
  });

});