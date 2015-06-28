'use strict';

var util = require('util'),
    Util = require('./util');
var debuglog = util.debuglog('PARSER');

/**
 * Constnats of character types
 */
var Chars = {
  LPAREN: '(',
  RPAREN: ')',
  SPACE: 'SPACE',
  DQUOTE: 'DQUOTE',
  QUOTE: 'QUOTE',
  ATOM: 'ATOM',
  SLCOMMENT: 'SLCOMMENT',
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
 * Pull snippet for error message 
 */
function snippet(exp, pos) {
  return exp.substring(pos, pos+10);
}

/**
 * Parse exp and return parsed results
 * @param exp {string}
 * @param pos {number}
 * @return token {Token}
 */
function parse(exp, pos) {
  var cht;
  pos = pos || 0;

  while(1) {
    cht = read_char(exp, pos);

    switch(cht) {
      case Chars.SPACE:
        pos += 1;
        continue;
      case Chars.LPAREN:
        return parse_list(exp, pos+1);
      case Chars.ATOM:
        return parse_atom(exp, pos);
      case Chars.QUOTE:
        return parse_quote(exp, pos);
      case Chars.DQUOTE:
        return parse_string(exp, pos);
      case Chars.SLCOMMENT:
        // skips until hitting line break
        pos = skip_sl_comment(exp, pos+1);
        continue;
    }
  }
}

/**
 * Read a char and return character type
 * @param exp {string}
 * @param pos {nnumber}
 * @return character type
 */
function read_char(exp, pos) {
  var ch, type;
  pos = pos || 0;

  if (pos >= exp.length) return Chars.EOF;

  ch = exp.charAt(pos);

  switch (ch) {
    case '(':    
      type = Chars.LPAREN;
      break;
    case ')':
      type = Chars.RPAREN;
      break;
    case ' ': case '\r': case '\t': case '\n':
      type = Chars.SPACE;
      break;
    case '"':
      type = Chars.DQUOTE;
      break;
    case '\'':
      type = Chars.QUOTE;
      break;
    case ';':
      type = Chars.SLCOMMENT;
      break;
    default:
      type = Chars.ATOM;
      break;
  }

  debuglog('char ', type, 'of "'+ch+'"');
  return type;
}

/**
 * Parse list
 * @param exp {string}
 * @param pos {nnumber}
 * @return {Token}
 */
function parse_list(exp, pos) {
  var startPos = pos,
      cht,
      token,
      message,
      tokens = [];
  debuglog('parse list at', pos);
  while (1) {
    cht = read_char(exp, pos);

    // skip space
    if (cht === Chars.SPACE) {
      pos +=1;
      continue;
    }

    if (cht === Chars.EOF) {
      message = 'S expression starting at %pos is not closed: %exp'
		      .replace('%pos', startPos)
		      .replace('%exp', snippet(exp, startPos));
      return Util.error(message);
    }

    // end of this list
    if (cht === Chars.RPAREN) {
      return new Token(tokens, pos);
    }

    // parse list item
    token = parse(exp, pos);
    tokens.push(token);
    pos = token.pos + 1;
  }
}

/**
 * Parse atom such as identifiers (for now we treat number as atom for convenience)
 * @param exp {string}
 * @param pos {nnumber}
 * @return {Token}
 */
function parse_atom(exp, pos) {
  var cht, message, startPos = pos;
  debuglog('parse item at', pos);

  // Read until meeting SPACE, ')', or EOF 
  while((cht = read_char(exp, pos)) !== Chars.SPACE
	&& (cht !== Chars.RPAREN)
	&& (cht !== Chars.EOF)) {

    if (cht !== Chars.ATOM) {
      message = 'Illegal token found at %pos: %exp'
	.replace('%pos', pos)
	.replace('%exp', snippet(exp, pos));
      return Util.error(message);
    }
    pos += 1;
  }
  
  return new Token(exp.substring(startPos, pos), pos-1);
}

/**
 * Parse string literal
 * @param exp {string}
 * @param pos {nnumber}
 * @return {Token}
 */
function parse_string(exp, pos) {
  var cht, startPos = pos;

  debuglog('parse string at', pos);
  pos += 1;
  // todo: handle escaped char
  while((cht = read_char(exp, pos)) !== Chars.DQUOTE) {
    pos += 1;
  }

  return new Token(exp.substring(startPos, pos+1), pos);
}

/**
 * Parse quote notation
 * @param exp {string}
 * @param pos {nnumber}
 * @return {Token}
 */
function parse_quote(exp, pos) {
  var cht, startPos = pos, literalToken, literal;

  debuglog('parse quote at', pos);
  pos += 1;

  // pull literal tokens
  literalToken = parse(exp, pos);

  return new Token([
    new Token('quote', startPos),
    literalToken
  ], literalToken.pos);
}

/**
 * Skip single line comment and returns new position
 * @param exp {string}
 * @param pos {nnumber}
 * @return pos {number}
 */
function skip_sl_comment(exp, pos) {
  var message,
      startPos = pos;

  debuglog('skip single line comment at', pos);

  while(exp.charAt(pos) !== '\n') {
    pos += 1;
    if (pos > exp.length) {
      message = 'Reached EOF while looking for end of single comment starting at %pos: %exp'
	.replace('%pos', startPos)
	.replace('%exp', snippet(exp, startPos-1));
      return Util.error(message);
    }

  }

  return pos;
}

module.exports = function(exp) {
  var token = parse(exp);
  return token.walk();
};