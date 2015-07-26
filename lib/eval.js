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

// eval main
function eval(exp, env) {
  var message;
  debuglog('eval', exp);
  if (is.selfEvaluating(exp)) return __evaled__(exp, 'self-evaluating');
  if (is.variable(exp))       return __evaled__(env.lookupVar(exp), 'variable '+exp);
  if (is.quoted(exp))         return __evaled__(Quotation.text(exp), 'quote');
  if (is.assignment(exp))     return Assignment.eval(exp, env);
  if (is.definition(exp))     return Definition.eval(exp, env);
  if (is.if(exp))             return If.eval(exp, env);
  if (is.lambda(exp))         return Proc.make(Lambda.params(exp), Lambda.body(exp), env);
  if (is.begin(exp))          return __evaled__(Seq.eval(Seq.beginActions(exp), env), 'begin');
  if (is.cond(exp))           return eval(__evaled__(Cond.toIf(exp), 'cond'), env);
  if (is.application(exp)) {
    return App.apply(
      eval(App.operator(exp), env),
      App.operandValues(App.operands(exp), env)
    );
  }
  message = 'Unknown expression type -- EVAL: %s'.replace('%s', S.toString(exp));
  Util.error(message);
}

// type test utilities
var is = {
  selfEvaluating: function(exp) {
    return S.isNumber(exp) || S.isString(exp);
  },
  definition: function(exp) {
    return taggedList('define', exp);
  },
  quoted: function(exp) {
    return taggedList('quote', exp);
  },
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
  },
  begin: function(exp) {
    return taggedList('begin', exp);
  },
  cond: function(exp) {
    return taggedList('cond', exp);
  },
  application: S.isPair
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
  isTrue: function (x) {
    return !If.isFalse(x);
  },
  isFalse: function (x) {
    return x === false;
  },
  predicate: S.cadr,
  consequent: S.caddr,
  alternative: function(exp) {
    return !S.isNull(S.cdddr(exp)) ? S.cadddr(exp) : false;
  },
  eval: function(exp, env) {
    var res, predVal = eval(this.predicate(exp), env);

    debuglog('if', exp);

    if (If.isTrue(predVal)) {
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
  },
  make: function(pred, cons, alt) {
    return S.list('if', pred, cons, alt);
  }
};

var Cond = {
  clauses:   S.cdr,
  predicate: S.car,
  actions:   S.cdr,
  isElseClause: function(exp) {
    return Cond.predicate(exp) === 'else';
  },
  toIf: function(exp) {
    return Cond.expand(Cond.clauses(exp));
  },  
  expand: function(clauses) {
    var first, rest;
    if (S.isNull(clauses)) return false;
    first = S.car(clauses);
    rest  = S.cdr(clauses);
    if (Cond.isElseClause(first)) {
      if (S.isNull(rest)) return Seq.toExp(Cond.actions(first));
      Util.error("ELSE clause isn't last -- Cond.toIf()");
      return;
    }
    return If.make(
      Cond.predicate(first),
      Seq.toExp(Cond.actions(first)),
      Cond.expand(rest)
    );
  }
};

var Lambda = {
  make: function(params, body) {
    return S.cons('lambda', S.cons(params, body));
  },
  params: S.cadr,
  body: S.cddr
};

var Seq = {
  beginActions: function(exp) {
    return S.cdr(exp);
  },
  isLastExp: function(seq) {
    return S.isNull(S.cdr(seq));
  },
  firstExp: function(seq) {
    return S.car(seq);
  },
  restExp: function(seq) {
    return S.cdr(seq);
  },
  eval: function(exps, env) {
    if (Seq.isLastExp(exps)) return eval(Seq.firstExp(exps), env);
    eval(Seq.firstExp(exps), env);
    return Seq.eval(Seq.restExp(exps), env);
  },
  makeBegin: function(seq) {
    return S.cons('begin', seq);
  },
  toExp: function(seq) {
    var res;
    if (S.isNull(seq))      return seq;
    if (Seq.isLastExp(seq)) return Seq.firstExp(seq);
    return Seq.makeBegin(seq);
  }
};

var Proc = {
  make: function(params, body, env) {
    return S.list('procedure', params, body, env);
  }
};

Proc.Primitive = Env.Primitive;

var App = {
  operator: S.car,
  operands: S.cdr,
  hasNoOperands: S.isNull,
  firstOperand: S.car,
  restOperands: S.cdr,
  operandValues: function(exps, env) {
    if (App.hasNoOperands(exps)) return exps;
    return S.cons(
      eval(App.firstOperand(exps), env),
      App.operandValues(App.restOperands(exps), env)
    );
  },
  applyPrimitive: function(proc, args) {
    return __evaled__(
      Proc.Primitive.apply(proc, args && args.toPrimitiveList()),
      'apply-primitive'
    );
  },
  apply: function(proc, args) {
    if (Proc.Primitive.isPrimitive(proc)) return App.applyPrimitive(proc, args);
    // TODO: compound proc
  }
};

module.exports = function scm_eval(src, env) {
  var exp = S.create(src);
  env = env || Env.setup();
  return eval(exp, env);
};
