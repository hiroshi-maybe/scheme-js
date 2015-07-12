var Util = require('./Util');

// Environment
// - `frame` is represented as plain JavaScript object { varName: value }

function Env(frame) {
  frame = frame || {};
  this.frame = frame;
  this.next = null;
}
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
  return Env.prototype.walk.apply(nextEnv, arguments);
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


module.exports = Env;
