var Util = require('./Util'),
    S = require('./S');

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

// Eval

function isSelfEvaluating(exp) {
  return S.isNumber(exp) || S.isString(exp);
}

function taggedList(tag, exp) {
  if (!S.isPair(exp)) return false;
  return S.car(exp) === tag;
}

var isQuoted = S.isSymbol;
var textOfQuotation = S.symbol;

function isDefinition(exp) {
  return taggedList('define', exp);
}
function definitionVar(exp) {
  var isLambda = S.isPair(S.cadr(exp));
  return isLambda ? S.caadr(exp) : S.cadr(exp);
}
function definitionVal(exp) {
  var isLambda = S.isPair(S.cadr(exp));
  return isLambda ? makeLambda(S.cdadr(exp), S.cddr(exp)) : S.caddr(exp);
}

function isAssignment(exp) {
  return taggedList('set!', exp);
}
function assignmentVar(exp) {
  return S.cadr(exp);
}
function assignmentVal(exp) {
  return S.caddr(exp);
}

// Our implementing language JavaScript cannot differentiate atom as symbol.
// Just look at if it's a pair or not.
function isVariable(exp) {
  return !S.isPair(exp);
}

function eval(exp, env) {
  var message;
  if (isSelfEvaluating(exp)) return exp;
  if (isVariable(exp))       return env.lookupVar(exp);
  if (isQuoted())            return textOfQuotation(exp);
  if (isAssignment(exp))     return evalAssignment(exp, env);
  if (isDefinition(exp))     return evalDefinition(exp, env);
  message = 'Unknown expression type -- EVAL: %s'.replace(S.toString(exp));
  Util.error(message);
}

function evalAssignment(exp, env) {
  env.setVar(assignmentVar(exp), eval(assignmentVal(exp), env), env);
}

function evalDefinition(exp, env) {
  env.defineVar(definitionVar(exp), eval(definitionVal(exp), env), env);
}

module.exports = {
  Env: Env,
  eval: function(src, env) {
    var exp = S.create(src);
    env = env || new Env();
    eval(exp, env);
  }
};
