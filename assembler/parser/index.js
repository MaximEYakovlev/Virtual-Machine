const A = require("arcsecond");
const constantParser = require("./constant");
const { data8, data16 } = require("./data");
const instructionsParser = require("./instructions");
const { label } = require("./common");
const structureParser = require("./structure");

module.exports = A.many(
  A.choice([
    constantParser,
    data8,
    data16,
    instructionsParser,
    label,
    structureParser,
  ])
).chain((res) => A.endOfInput.map(() => res));
