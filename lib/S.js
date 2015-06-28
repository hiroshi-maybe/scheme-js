'use strict';
/**
 * S expression wrapper. Create S expression object represented by pair.
 */

var Util = require('./util'),
    parse = require('./parse');

/**
 * defined as a pair of two elements `fst` and `snd`
 */
function S(fst, snd) {
  this.fst = fst;
  this.snd = snd;
}

var symbolChars = ['!','#','$','%','&','|','*','+','-','/',':','<','=','>','?','@','^','_','~'],
    symbolPat = symbolChars.join(''),
    letterPat = 'a-zA-Z',
    digitPat = '0-9',
    basePat = '^[%LETTER%SYMBOL][%LETTER%DIGIT%SYMBOL]*$',
    atomRegexStr = Util.replaceAll(
      Util.replaceAll(
	Util.replaceAll(basePat,
			'%LETTER', letterPat),
	'%SYMBOL', symbolPat),
      '%DIGIT', digitPat),
    atomRegex = new RegExp(atomRegexStr);

function validateAtom(str) {  
  return !!atomRegex.exec(str);
}

function createList(tokens) {
  var i, len, message, head, s, prevS;

  len = tokens.length;
  if (len === 0) return null;
    
  for(i=0; i<len; i+=1) {
    // handle dotted-list
    if (tokens[i] === '.') {
      if (i !== len-2 || i==0) {
	// (a . b c) or (. a)
	message = 'Ill-formed dotted list: (%s)'.replace('%s', tokens.join(' '));
	return Util.error(message);
      }
      prevS.snd = create(tokens[i+1]);
      break;
    }

    s = new S(create(tokens[i]), null);
    if (i===0) {
      head = s;
    } else {
      prevS.snd = s;
    }
    prevS = s;
  }
  return head;
}

function create(token) {
  var i, len, rest, message, head, s;
  /************** list *************/
  if (Array.isArray(token)) {
    return createList(token);
  }
  /************** atom *************/
  var num = parseFloat(token);
  // number
  if (!isNaN(num)) return num;
  // boolean: true
  if (token === '#t') return true;
  // boolean: false
  if (token === '#f') return false;
  // string ("xxxx")
  if (S.isString(token)) return token;
  // atom
  if (validateAtom(token)) return token;

  message = 'Invalid token: %s'.replace('%s', token);
  return Util.error(message);
}

S.create = function(source) {
  return create(parse(source));
};

S.isNull = function(s) {
  return s === null;
};

S.isPair = function(s) {
  return s instanceof S;
};

S.isString = function(s) {
  return s.match('^"(.*)"$');
};

// TODO: generate programably
S.car = function(s) {
  return s.fst;
};
S.cdr = function(s) {
  return s.snd;
};
S.caar = function(s) {
  return S.car(S.car(s));
};
S.cadr = function(s) {
  return S.car(S.cdr(s));
};
S.cdar = function(s) {
  return S.cdr(S.car(s));
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
