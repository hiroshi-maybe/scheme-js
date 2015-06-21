'use strict';

var util = require('util');

var debuglog = util.debuglog('PARSER');

/**
 * Constnats of character types
 */
var Chars = {
  LPAREN: '(',
  RPAREN: ')',
  SPACE: 'S',
  DQUOTE: '"',
  EXPR: 'EXPR',
  EOF: 'EOF'
};

/**
 * Helper to hold result of parses
 */
function Token(val, pos) {
  this.val = val; // {string} or {Token}
  this.pos = pos; // {integer}
}

/**
 * unwrap token and return parsed values
 * @return {Array} or {string}
 */
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
};

/**
 * Parse exp and return parsed results
 * @param exp {string}
 * @param pos {number}
 * @return token {Token}
 */
function parse(exp, pos) {
  var chr;
  pos = pos || 0;

  while(1) {    
    chr = read_char(exp, pos);
    if (chr === Chars.SPACE) {
      pos += 1;
      continue;
    }

    if (chr === Chars.LPAREN) {
      return parse_list(exp, pos+1);
    }
    if (chr === Chars.EXPR) {
      return parse_item(exp, pos);
    }
  }
}

/**
 * Read a char and return character type
 * @param exp {string}
 * @param pos {number}
 * @return character type
 */
function read_char(exp, pos) {
  pos = pos || 0;

  if (pos >= exp.length) return Chars.EOF;

  switch (exp.charAt(pos)) {
    case '(':
      return Chars.LPAREN;
    case ')':
      return Chars.RPAREN;
    case ' ': case '\n': case '\r': case '\t':
      return Chars.SPACE;
    case '"':
      return Chars.DQUOTE;
    default:
      return Chars.EXPR;
  }
}

function parse_list(exp, pos) {
  var chr,
      token,
      tokens = [];

  while (1) {
    chr = read_char(exp, pos);

    // skip space
    if (chr === Chars.SPACE) {
      pos +=1;
      continue;
    }

    // end of this list
    if (chr === Chars.RPAREN) {
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

  while((chr = read_char(exp, pos)) !== Chars.SPACE && (chr !== Chars.RPAREN)) {
    if (chr !== Chars.EXPR) {
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