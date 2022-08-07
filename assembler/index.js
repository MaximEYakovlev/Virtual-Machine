const parser = require("./parser");
const instructions = require("../instructions");
const { instructionTypes: I } = require("../instructions/meta");
const registers = require("../registers");

const registerMap = registers.reduce((map, regName, index) => {
  map[regName] = index;
  return map;
}, {});

const exampleProgram = [
  "start:",
  "  mov $0A, &0050",
  "loop:",
  "  mov &0050, acc",
  "  dec acc",
  "  mov acc, &0050",
  "  inc r2",
  "  inc r2",
  "  inc r2",
  "  jne $00, &[!loop]",
  "end:",
  "  hlt",
].join("\n");

const parsedOutput = parser.run(exampleProgram);

const machineCode = [];
const labels = {};
let currentAddress = 0;

parsedOutput.result.forEach((instructionOrLabel) => {
  if (instructionOrLabel.type === "LABEL") {
    labels[instructionOrLabel.value] = currentAddress;
  } else {
    const metadata = instructions[instructionOrLabel.value.instruction];
    currentAddress += metadata.size;
  }
});

const encodeLitOrMem = (lit) => {
  let hexVal;
  if (lit.type === "VARIABLE") {
    if (!(lit.value in labels)) {
      throw new Error(`label "${lit.value}" wasn't resolved.`);
    }
    hexVal = labels[lit.value];
  } else {
    hexVal = parseInt(lit.value, 16);
  }
  const highByte = (hexVal & 0xff00) >> 8;
  const lowByte = hexVal & 0x00ff;
  machineCode.push(highByte, lowByte);
};

const encodeLit8 = (lit) => {
  let hexVal;
  if (lit.type === "VARIABLE") {
    if (!(lit.value in labels)) {
      throw new Error(`label "${lit.value}" wasn't resolved.`);
    }
    hexVal = labels[lit.value];
  } else {
    hexVal = parseInt(lit.value, 16);
  }
  const lowByte = hexVal & 0x00ff;
  machineCode.push(lowByte);
};

const encodeReg = (reg) => {
  const mappedReg = registerMap[reg.value];
  machineCode.push(mappedReg);
};

parsedOutput.result.forEach((instruction) => {
  if (instruction.type !== "INSTRUCTION") {
    return;
  }

  const metadata = instructions[instruction.value.instruction];
  machineCode.push(metadata.opcode);

  if ([I.litReg, I.memReg].includes(metadata.type)) {
    encodeLitOrMem(instruction.value.args[0]);
    encodeReg(instruction.value.args[1]);
  }

  if ([I.regLit, I.regMem].includes(metadata.type)) {
    encodeReg(instruction.value.args[0]);
    encodeLitOrMem(instruction.value.args[1]);
  }

  if (I.regLit8 === metadata.type) {
    encodeReg(instruction.value.args[0]);
    encodeLit8(instruction.value.args[1]);
  }

  if ([I.regReg, I.regPtrReg].includes(metadata.type)) {
    encodeReg(instruction.value.args[0]);
    encodeReg(instruction.value.args[1]);
  }

  if (I.litMem === metadata.type) {
    encodeLitOrMem(instruction.value.args[0]);
    encodeLitOrMem(instruction.value.args[1]);
  }

  if (I.litOffReg === metadata.type) {
    encodeLitOrMem(instruction.value.args[0]);
    encodeReg(instruction.value.args[1]);
    encodeReg(instruction.value.args[2]);
  }

  if (I.singleReg === metadata.type) {
    encodeReg(instruction.value.args[0]);
  }

  if (I.singleLit === metadata.type) {
    encodeLitOrMem(instruction.value.args[0]);
  }
});

console.log(machineCode.join(" "));
