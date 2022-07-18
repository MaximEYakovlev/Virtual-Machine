const A = require("arcsecond");

const asType = (type) => (value) => ({ type, value });

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
