const { inspect } = require("util");
const A = require("arcsecond");

const deepLog = (x) =>
  console.log(
    inspect(x, {
      depth: Infinity,
      colors: true,
    })
  );

const asType = (type) => (value) => ({ type, value });
const mapJoin = (parser) => parser.map((items) => items.join(""));

const upperOrLowerStr = (s) =>
  A.choice([A.str(s.toUpperCase()), A.str(s.toLowerCase())]);

const register = A.choice([
  upperOrLowerStr("r1"),
  upperOrLowerStr("r2"),
  upperOrLowerStr("r3"),
  upperOrLowerStr("r4"),
  upperOrLowerStr("r5"),
  upperOrLowerStr("r6"),
  upperOrLowerStr("r7"),
  upperOrLowerStr("r8"),
  upperOrLowerStr("sp"),
  upperOrLowerStr("fp"),
  upperOrLowerStr("ip"),
  upperOrLowerStr("acc"),
]).map(asType("REGISTER"));

const hexDigit = A.regex(/^[0-9A-Fa-f]/);
const hexLiteral = A.char("s")
  .chain(() => mapJoin(A.many1(hexDigit)))
  .map(asType("HEX_LITERAL"));

const movLitToReg = A.coroutine(function* () {
  yield upperOrLowerStr("mov");
  yield A.whitespace;

  const arg1 = yield hexLiteral;

  yield A.optionalWhitespace;
  yield A.char(",");
  yield A.optionalWhitespace;

  const arg2 = yield register;
  yield A.optionalWhitespace;

  return asType("INSTRUCTION")({
    instruciton: "MOV_LIT_REG",
    args: [arg1, arg2],
  });
});

const res = movLitToReg.run("mov s42, r4");
deepLog(res);
