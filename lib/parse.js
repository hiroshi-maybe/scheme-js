'use strict';

var util = require('util');

var debuglog = util.debuglog('PARSER');

var Tokens = {
  LPAREN: '(',
  RPAREN: ')',
  SPACE: ' ',
  DQUOTE: '"',
  EXPR: 'EXPR',
  EOF: 'EOF'
};

function Token(val, pos) {
  this.val = val;
  this.pos = pos;
}

Token.prototype.walk = function() {
  if (this.val instanceof Token) {
    return this.val.walk();
  }
  if (Array.isArray(this.val)) {
    return this.val.map(function(token) {
      return token.walk();
    });
  }
  return this.val;
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
 * Parse exp and return S expression represented as list
 * @param exp {string}
 * @param pos {number}
 * @return token {Token}
 */
function parse(exp, pos) {
  var chr;
  pos = pos || 0;

  while(1) {    
    chr = read(exp, pos);
    if (chr === Tokens.SPACE) {
      pos += 1;
      continue;
    }

    if (chr === Tokens.LPAREN) {
      return parse_list(exp, pos+1);
    }
    if (chr === Tokens.EXPR) {
      return parse_item(exp, pos);
    }
  }
}

function read(exp, pos) {
  pos = pos || 0;

  if (pos >= exp.length) return Tokens.EOF;

  switch (exp.charAt(pos)) {
    case '(':
      return Tokens.LPAREN;
    case ')':
      return Tokens.RPAREN;
    case ' ': case '\n': case '\r': case '\t':
      return Tokens.SPACE;
    case '"':
      return Tokens.DQUOTE;
    default:
      return Tokens.EXPR;
  }
}

function parse_list(exp, pos) {
  var chr,
      token,
      tokens = [];

  while (1) {
    chr = read(exp, pos);

    // skip space
    if (chr === Tokens.SPACE) {
      pos +=1;
      continue;
    }

    // end of this list
    if (chr === Tokens.RPAREN) {
      debuglog('list', tokens);
      return new Token(tokens, pos);
    }

    // parse list item
    token = parse(exp, pos);
    tokens.push(token);
    pos = token.pos + 1;
  }
}

function parse_item(exp, pos) {
  var chr, startPos = pos;

  while((chr = read(exp, pos)) !== Tokens.SPACE && (chr !== Tokens.RPAREN)) {
    if (chr !== Tokens.EXPR) {
      throw new Error('Illegal token found: ' + exp.charAt(pos) + ' at ' + pos);
    }
    pos += 1;
  }
  
  return new Token(exp.substring(startPos, pos), pos-1);
}

function parse_string(exp) {
  // todo
}

module.exports = function(exp) {
  var token = parse(exp);
  return token.walk();
};