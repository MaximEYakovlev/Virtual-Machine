const A = require("arcsecond");
const constantParser = require("./constant");
const { data8, data16 } = require("./data");
const instructionsParser = require("./instructions");
const { label } = require("./common");

module.exports = A.many(
  A.choice([constantParser, data8, data16, instructionsParser, label])
).chain((res) => A.endOfInput.map(() => res));
