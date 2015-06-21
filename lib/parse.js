'use strict';

var LPAREN = '(',
    RPAREN = ')';
    ;

function Token(val, pos) {
  this.val = val;
  this.pos = pos;
}

/**
 * Skip spaces until chars found, and returns next valie position
 * @param exp {string}
 * @param pos {number}
 * @return {number}
 */
function skip_space(exp, pos) {
  while (exp.charAt(pos).match(/\s/) !== null) {
    pos+=1;
  }
  return pos;
}

/**
 * Parse source and return S expression represented as list
 * @param exp {string}
 * @param pos {number}
 * @return token {Token}
 */
function parse(exp, pos) {
  var token;
  pos = pos || 0;
  while(1) {
    switch (exp.charAt(pos)) {
      case '(':
        return parse_list(exp, pos+1);
      case ')':
        return RPAREN;
      default:
        return parse_item(exp, pos);
    }
  }
console.log('parse', pos);
}

function parse_list(exp, pos) {
  var token,
      tokens = [];
  pos = skip_space(exp, pos);
  while (exp.charAt(pos) != ')' && pos < exp.length) {
    token = parse(exp, pos);
    tokens.push(token);
    pos = token.pos + 1;
    pos = skip_space(exp, pos);
  }
  return new Token(tokens, pos+1);
}

function parse_item(exp, pos) {
  var endPos;
  switch (exp.charAt(pos)) {
    case '"':
      return parse_string(exp, pos);
    default:
      // todo: test with regex \s
      endPos = Math.min(exp.indexOf(' ', pos), exp.indexOf(')', pos));
      if (endPos === -1) endPos = exp.length;
      return new Token(exp.substring(pos, endPos), endPos-1);
  }
}

function parse_string(exp) {
  // todo
}

console.log(parse('(+ 1 2)'));

module.exports = parse;