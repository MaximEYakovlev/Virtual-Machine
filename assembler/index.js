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

const exampleProgram = [
  "mov $4200, r1",
  "mom r1, &0060",
  "mov $1300, r1",
  "mov &0060, r2",
  "add r1, r2",
].join("\n");

const parsedOutput = parser.run(exampleProgram);

const machineCode = [];

const encodeLitOrMem = (lit) => {
  const hexVal = parseInt(lit.value, 16);
  const highByte = (hexVal & 0xff00) >> 8;
  const lowByte = hexVal & 0x00ff;
  machineCode.push(highByte, lowByte);
};

const encodeLit8 = (lit) => {
  const hexVal = parseInt(lit.value, 16);
  const lowByte = hexVal & 0x00ff;
  machineCode.push(lowByte);
};

const encodeReg = (reg) => {
  const mappedReg = registerMap[reg.value];
  machineCode.push(mappedReg);
};

parsedOutput.result.forEach((instruction) => {
  const metadata = instructions[instruction.value.instruction];
  machineCode.push(metadata.opcode);



});
