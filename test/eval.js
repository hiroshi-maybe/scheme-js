/*global describe:false, before:false, after:false, it:false*/
'use strict';

var assert = require('assert'),
    scm_eval = require('../lib/eval'),
    Env = require('../lib/env'),
    S = require('../lib/S');

describe('Scheme', function () {
  describe('evaluator', function() {
    it('should evaluate self-evaluating value', function () {
      var res, env = Env.setup();
      res = scm_eval('1', env);
      assert.strictEqual(res, 1);

      res = scm_eval('"Hello Scheme"', env);
      assert.strictEqual(res, '"Hello Scheme"');
    });

    it('should evaluate variable', function () {
      var res, env = Env.setup();
      env.defineVar('x', 100);
      res = scm_eval('x', env);
      assert.strictEqual(res, 100);
    });

    it('should evaluate quoted', function () {
      var res, env = Env.setup();
      res = scm_eval("'a", env);
      assert.strictEqual(res, 'a');

      res = scm_eval("(quote b)", env);
      assert.strictEqual(res, 'b');

      res = scm_eval("'(a)", env);
      assert.deepEqual(res, S.create('(a)'));

      res = scm_eval("(quote (b))", env);
      assert.deepEqual(res, S.create('(b)'));

      res = scm_eval("'(a b)", env);
      assert.deepEqual(res, S.create('(a b)'));

      res = scm_eval("(quote (a b))", env);
      assert.deepEqual(res, S.create('(a b)'));
    });

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

      res = scm_eval('(if #f 100 -1)', env);
      assert.strictEqual(res, -1);

      res = scm_eval('(if #t (if #f 100 101) -1)', env);
      assert.strictEqual(res, 101);

      res = scm_eval('(if #f -1 (if #f 100 101))', env);
      assert.strictEqual(res, 101);
    });

    it('should evaluate begin', function () {
      var res,
          env = Env.setup();
      res = scm_eval('(begin (define x 1) (set! x 10) x)', env);
      assert.strictEqual(res, 10);
    });

    it('should evaluate cond', function () {
      var res,
          env = Env.setup();
      env.defineVar('x', 7);
      res = scm_eval('(cond (#f 1) (#t 2) (else 3))', env);
      assert.strictEqual(res, 2);
    });
  });

});