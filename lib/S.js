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

/**
 * Validate with spec of Scheme atom
 */
var symbolChars = ['!','#','$','%','&','|','*','+','-','/',':','<','=','>','?','@','^','_','~'],
    symbolPat = '\\' + symbolChars.join('\\'),
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
  if (typeof str !== 'string') { return false; }
  return !! atomRegex.exec(str);
}

function createList(tokens, options) {
  var head, rest, message, listIdx, orgList;

  if (tokens.length === 0) return null;

  if (options) {
    listIdx = options.listIdx;
    orgList = options.orgList;
  }
  orgList = orgList || tokens;
  head = tokens[0];

  // handle dotted-list
  if (head === '.') {
    if (tokens.length !== 2 || listIdx===undefined) {
      // (a . b c) or (. a)
      message = 'Ill-formed dotted list: (%s)'.replace('%s', orgList.join(' '));
      return Util.error(message);
    }
    return create(tokens[1]);
  }
  rest = tokens.slice(1);
  listIdx = listIdx || 0;
  options = { listIdx: listIdx+1, orgList: orgList };
  return new S(create(head), create(rest, options));
}

/**
 * Core logic to construct S expression from tokens.
 * @param token {array} | {string}
 * @param options {object} memoize list information for error handling
 * @return {S} | {string} | {number} | {boolean}
 */
function create(token, options) {
  var message;
  /************** list *************/
  if (Array.isArray(token)) {
    return createList(token, options);
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
  try {
    return s.match('^"(.*)"$');    
  } catch (x) {
    return false;
  }
};

S.isNumber = function(s) {
  return typeof s == 'number';
};

S.isSymbol = function(s) {
  try {
    return S.car(s) === 'quote' && validateAtom(S.cadr(s));    
  } catch (x) {
    return false;
  }
};

// Pull symbol literal from `(quote abc)`.
S.symbol = function(s) {
  return S.cadr(s);
};

// TODO: generate below programably

S.car = function(s) {
  var message;
  try {
    return s.fst;
  } catch (x) {
    message = 'The object %s, passed as the first argument to car, is not the correct type.'
    .replace('%s', s);
    Util.error(message);
  }
};

S.cdr = function(s) {
  var message;
  try {
    return s.snd;
  } catch (x) {
    message = 'The object %s, passed as the first argument to cdr, is not the correct type.'
    .replace('%s', s);
    Util.error(message);
  }
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
S.cadaddr = function(s) {
  return S.car(S.cdr(S.car(S.cdr(S.cdr(s)))));
};
S.cdddadr = function(s) {
  return S.cdr(S.cdr(S.cdr(S.car(S.cdr(s)))));
};
S.caddaddr = function(s) {
  return S.car(S.cdr(S.cdr(S.car(S.cdr(S.cdr(s))))));
};

module.exports = S;
