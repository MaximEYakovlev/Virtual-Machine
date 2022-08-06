const instructionsParser = require("./instructions");
const A = require("arcsecond");
const { label } = require("./common");

module.exports = A.many(A.choice([instructionsParser, label]));
