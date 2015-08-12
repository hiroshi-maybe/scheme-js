var Util = require('./Util'),
    S = require('./S'),
    util = require('util');
var debuglog = util.debuglog('ENV');

var Primitive = {
  isPrimitive: function(proc) {
    return S.car(proc) === 'primitive';
  },
  toS: function(func) {
    return S.list('primitive', func);
  },
  func: S.cadr,
  apply: function(proc, args) {
    return Primitive.func(proc).apply(null, args);
  }
};

function add(a, b) { return a+b; }
function multiply(a, b) { return a*b; }
function subtract(a, b) { return a-b; }
function equal(a, b) { return a===b; }

var Primitives = {
  '+': function sum() {
    var args = Util.toArray(arguments);
    return args.reduce(add, 0);
  },
  '*': function prod() {
    var args = Util.toArray(arguments);
    return args.reduce(multiply, 1);
  },
  '-': function sub() {
    var args = Util.toArray(arguments),
        head = args[0];
    return args.slice(1).reduce(subtract, head);
  },
  '=': function eq() {
    var args = Util.toArray(arguments);
    return args.every(equal.bind(null, args[0]));
  }
};

// Environment
// - `frame` is represented as plain JavaScript object { varName: value }

function Env(frame) {
  frame = frame || {};
  this.frame = frame;
  this.next = null;
}

Env.setup = function() {
  var initialEnv, emptyEnv = new Env();

  initialEnv = Env.extend(emptyEnv, Util.objMap(Primitives, Primitive.toS));
  initialEnv.defineVar('true', true);
  initialEnv.defineVar('false', false);

  return initialEnv;
};

Env.extend = function(baseEnv /* frame or params, operandValues */) {
  var frame, params, values, newEnv;
  if (arguments.length == 2) {
    frame = arguments[1];
  } else {
    params = arguments[1];
    values = arguments[2];
    frame = params.reduce(function(frame, param, i) {
      frame[param] = values[i];
      return frame;
    }, {});
  }
  
  newEnv = new Env(frame);
  newEnv.next = baseEnv;

  return newEnv;
};
Env.prototype.searchVarFrame = function(vari, onFound) {
  debuglog('walk looking up ' + vari + ' from ' + Object.keys(this.frame));
  var message, nextEnv;

  // var found
  if (this.frame.hasOwnProperty(vari)) return onFound(this.frame);

  nextEnv = this.next;

  // no more enclosing frames
  if (Env.isEmpty(nextEnv)) {
    message = "Unbound variable: %s".replace('%s', vari);
    Util.error(message);
  }

  // walk to enclosing env
  return Env.prototype.searchVarFrame.apply(nextEnv, arguments);
};

Env.prototype.lookupVar = function(vari) {
  return this.searchVarFrame(vari, function(frame) {
    return frame[vari];
  });
};

Env.prototype.defineVar = function(vari, val) {
  this.frame[vari] = val;
};

Env.prototype.setVar = function(vari, val) {
  return this.searchVarFrame(vari, function(frame) {
    return frame[vari] = val;
  });
};

Env.isEmpty = function(env) {
  return env === null;
};

Env.Primitive = Primitive;

module.exports = Env;
