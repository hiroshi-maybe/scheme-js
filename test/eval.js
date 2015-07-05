/*global describe:false, before:false, after:false, it:false*/
'use strict';

var assert = require('assert'),
    Scheme = require('../lib/eval'),
    S = require('../lib/S');

var Env = Scheme.Env;

describe('Scheme', function () {

  describe('evaluator', function() {
    it('should evaluate definition', function () {
      var env = new Env();
      Scheme.eval('(define x 1)', env);
      assert.strictEqual(env.lookupVar('x'), 1);
    });
  });

});