/*global describe:false, before:false, after:false, it:false*/
'use strict';

var assert = require('assert'),
    scm_eval = require('../lib/eval'),
    Env = require('../lib/env'),
    S = require('../lib/S');

describe('Scheme', function () {
  describe('evaluator', function() {
    it('should evaluate definition', function () {
      var env = new Env();
      scm_eval('(define x 1)', env);
      assert.strictEqual(env.lookupVar('x'), 1);
    });
  });

});