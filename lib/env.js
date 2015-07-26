var Util = require('./Util'),
    S = require('./S');

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

var Primitives = {
  '+': function sum() {
    var args = Util.toArray(arguments);
    return args.reduce(add, 0);
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
  var initialEnv = new Env();

  initialEnv.extend(Util.objMap(Primitives, Primitive.toS));
  initialEnv.defineVar('true', true);
  initialEnv.defineVar('false', false);

  return initialEnv;
};

Env.prototype.extend = function(frame) {
  this.next = new Env(frame);
};
Env.prototype.searchVarFrame = function(vari, onFound) {
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
