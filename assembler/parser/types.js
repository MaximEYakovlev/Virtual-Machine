const { asType } = require("./util");

const register = asType("REGISTER");
const hexLiteral = asType("HEX_LITERAL");
const address = asType("ADDRESS");
const variable = asType("VARIABLE");

const opPlus = asType("OP_PLUS");
const opMinus = asType("OP_MINUS");
const opMultiply = asType("OP_MULTIPLY");

const binaryOperation = asType("BINARY_OPERATION");
const bracketedExpression = asType("BRACKETED_EXPRESSION");
const squareBracketExpression = asType("SQUARE_BRACKET_EXPRESSION");

const instruction = asType("INSTRUCTION");
const label = asType("LABEL");
const data = asType("DATA");
const constant = asType("CONSTANT");
const structure = asType("STRUCTURE");
const interpretAs = asType("INTERPRET_AS");

module.exports = {
  label,
  register,
  hexLiteral,
  variable,
  address,
  opPlus,
  opMinus,
  opMultiply,
  binaryOperation,
  bracketedExpression,
  squareBracketExpression,
  instruction,
  data,
  constant,
  structure,
  interpretAs,
};
