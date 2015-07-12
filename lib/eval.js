var Util = require('./Util'),
    S = require('./S'),
    Env = require('./env'),
    util = require('util');
var debuglog = util.debuglog('EVAL');

// insert debuglog for evaluated value
function __evaled__(val, label) {
  debuglog(label, val);
  return val;
}

function taggedList(tag, exp) {
  if (!S.isPair(exp)) return false;
  return S.car(exp) === tag;
}

function makeProcedure(params, body, env) {
  return S.list('procedure', params, body, env);
}

function isTrue(x) {
  return !isFalse(x);
}
function isFalse(x) {
  return x === false;
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
  },
  if: function(exp) {
    return taggedList('if', exp);
  },
  lambda: function(exp) {
    return taggedList('lambda', exp);
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
    return this._isLambda(exp) ? Lambda.make(S.cdadr(exp), S.cddr(exp)) : S.caddr(exp);
  },
  eval: function(exp, env) {
    var vari = this.var(exp);
    return __evaled__(
      env.defineVar(vari, eval(this.val(exp), env), env),
      'define var '+vari
    );
  }
};

var Assignment = {
  var: S.cadr,
  val: S.caddr,
  eval: function(exp, env) {
    var vari = this.var(exp),
        val = eval(this.val(exp), env);

    return __evaled__(
      env.setVar(this.var(exp), val, env),
      'assign '+vari+':='+val
    );
  }
};

var If = {
  predicate: S.cadr,
  consequent: S.caddr,
  alternative: function(exp) {
    return !S.isNull(S.cdddr(exp)) ? S.cdddr(exp) : false;
  },
  eval: function(exp, env) {
    var res, predVal = eval(this.predicate(exp), env);

    debuglog('if', exp);

    if (isTrue(predVal)) {
      return __evaled__(
	eval(this.consequent(exp), env),
	'if-consequent'
      );
    } else {
      return __evaled__(
	eval(this.alternative(exp), env),
	'if-alternative'
      );
    }
 }
};

var Lambda = {
  make: function(params, body) {
    return S.cons('lambda', S.cons(params, body));
  },
  params: S.cadr,
  body: S.cddr
};

function eval(exp, env) {
  var message;
  debuglog('eval', exp);
  if (is.selfEvaluating(exp)) return __evaled__(exp, 'self-evaluating');
  if (is.variable(exp))       return __evaled__(env.lookupVar(exp), 'variable '+exp);
  if (is.quoted())            return __evaled__(Quotation.text(exp), 'quote');
  if (is.assignment(exp))     return Assignment.eval(exp, env);
  if (is.definition(exp))     return Definition.eval(exp, env);
  if (is.if(exp))             return If.eval(exp, env);
  if (is.lambda(exp))         return makeProcedure(Lambda.params(exp), Lambda.body(exp), env);
  message = 'Unknown expression type -- EVAL: %s'.replace(S.toString(exp));
  Util.error(message);
}

module.exports = function scm_eval(src, env) {
  var exp = S.create(src);
  env = env || Env.setup();
  return eval(exp, env);
};