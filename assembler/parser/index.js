const instructionsParser = require("./instructions");
const A = require("arcsecond");

module.exports = A.many(instructionsParser);
