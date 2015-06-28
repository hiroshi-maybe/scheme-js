'use strict';
/**
 * S expression wrapper. Create S expression object represented by pair.
 */

var Util = require('./util');

/**
 * defined as a pair of two elements `fst` and `snd`
 */
function S(fst, snd) {
  this.fst = fst;
  this.snd = snd;
}

S.create = function(tokens) {
  var token, rest, message;
  /************** list *************/
  if (Array.isArray(tokens)) {
    if (tokens.length === 0) return null;
    token = tokens[0];

    // handle dotted-list
    if (token === '.') {
      // todo: erroring '(. b)
      if (tokens.length !== 2) {
	message = 'Ill-formed dotted list: %s'.replace('%s', tokens.join(' '));
	return Util.error(message);
      }
      return S.create(tokens[1]);
    }
    rest = tokens.slice(1);
    return new S(S.create(token), S.create(rest));
  }
  /************** atom *************/
  token = tokens;
  var num = parseFloat(token);
  // number
  if (!isNaN(num)) return num;
  // boolean: true
  if (token === '#t') return true;
  // boolean: false
  if (token === '#f') return false;
  // string
  return token.match('^"(.*)"$') ? token.substring(1, token.length-1) : token;
};

S.isPair = function(s) {
  return s instanceof S;
};

// TODO: generate programably
S.car = function(s) {
  return s.fst;
};
S.cdr = function(s) {
  return s.snd;
};
S.cadr = function(s) {
  return S.car(S.cdr(s));
};
S.cddr = function(s) {
  return S.cdr(S.cdr(s));
};
S.caadr = function(s) {
  return S.car(S.car(S.cdr(s)));
};
S.caddr = function(s) {
  return S.car(S.cdr(S.cdr(s)));
};
S.cdddr = function(s) {
  return S.cdr(S.cdr(S.cdr(s)));
};
S.cadadr = function(s) {
  return S.car(S.cdr(S.car(S.cdr(s))));
};
S.cddadr = function(s) {
  return S.cdr(S.cdr(S.car(S.cdr(s))));
};
S.cadddr = function(s) {
  return S.car(S.cdr(S.cdr(S.cdr(s))));
};
S.cddddr = function(s) {
  return S.cdr(S.cdr(S.cdr(S.cdr(s))));
};
S.caaddr = function(s) {
  return S.car(S.car(S.cdr(S.cdr(s))));
};
S.cdddadr = function(s) {
  return S.cdr(S.cdr(S.cdr(S.car(S.cdr(s)))));
};

module.exports = S;
