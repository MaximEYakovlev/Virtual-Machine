const parser = require("./parser");
const instructions = require("../instructions");
const { instructionTypes: I } = require("../instructions/meta");

const registerMap = {
  ip: 0,
  acc: 1,
  r1: 2,
  r2: 3,
  r3: 4,
  r4: 5,
  r5: 6,
  r6: 7,
  r7: 8,
  r8: 9,
  sp: 10,
  fp: 11,
};
