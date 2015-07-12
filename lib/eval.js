var Util = require('./Util'),
    S = require('./S'),
    Env = require('./env');

function taggedList(tag, exp) {
  if (!S.isPair(exp)) return false;
  return S.car(exp) === tag;
}

function makeLambda(params, body) {
  return S.cons('lambda', S.cons(params, body));
}

// type test utilities
var is = {
  selfEvaluating: function(exp) {
    return S.isNumber(exp) || S.isString(exp);
  },
  definition: function(exp) {
    return taggedList('define', exp);
  },
  quoted: S.isSymbol,
  assignment: function(exp) {
    return taggedList('set!', exp);
  },
  variable: function(exp) {
    // Our implementing language JavaScript cannot differentiate atom as symbol.
    // Just look at if it's a pair or not.
    return !S.isPair(exp);
  }
};

var Quotation = {
  text: S.symbol
};

var Definition = {
  _isLambda: function(exp) {
    return S.isPair(S.cadr(exp));
  },
  var: function(exp) {
    return this._isLambda(exp) ? S.caadr(exp) : S.cadr(exp);
  },
  val: function(exp) {
    return this._isLambda(exp) ? makeLambda(S.cdadr(exp), S.cddr(exp)) : S.caddr(exp);
  },
  eval: function(exp, env) {
    env.defineVar(this.var(exp), eval(this.val(exp), env), env);
  }
};

var Assignment = {
  var: function(exp) {
    return S.cadr(exp);
  },
  val: function(exp) {
    return S.caddr(exp);
  },
  eval: function(exp, env) {
    env.setVar(this.var(exp), eval(this.val(exp), env), env);
  }
};

function eval(exp, env) {
  var message;
  if (is.selfEvaluating(exp)) return exp;
  if (is.variable(exp))       return env.lookupVar(exp);
  if (is.quoted())            return Quotation.text(exp);
  if (is.assignment(exp))     return Assignment.eval(exp, env);
  if (is.definition(exp))     return Definition.eval(exp, env);
//  if (isIf(exp))             return evalIf(exp, env);
  message = 'Unknown expression type -- EVAL: %s'.replace(S.toString(exp));
  Util.error(message);
}

module.exports = function scm_eval(src, env) {
  var exp = S.create(src);
  env = env || new Env();
  eval(exp, env);
};