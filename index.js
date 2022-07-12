const readline = require("readline");
const createMemory = require("./create-memory");
const CPU = require("./cpu");
const instructions = require("./instructions");
const MemoryMapper = require("./memory-mapper");
const createScreenDevice = require("./screen-device");

const IP = 0;
const ACC = 1;
const R1 = 2;
const R2 = 3;
const R3 = 4;
const R4 = 5;
const R5 = 6;
const R6 = 7;
const R7 = 8;
const R8 = 9;
const SP = 10;
const FP = 11;

const MM = new MemoryMapper();

const memory = createMemory(256 * 256);
MM.map(memory, 0, 0xffff);

// Map 0xFF bytes of the address space to an "output device" - just stdout
MM.map(createScreenDevice(), 0x3000, 0x30ff, true);

const writableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(MM);
let i = 0;

const writeCharToScreen = (char, position) => {
  writableBytes[i++] = instructions.MOV_LIT_REG;
  writableBytes[i++] = 0x00;
  writableBytes[i++] = char.charCodeAt(0);
  writableBytes[i++] = R1;

  writableBytes[i++] = instructions.MOV_REG_MEM;
  writableBytes[i++] = R1;
  writableBytes[i++] = 0x30;
  writableBytes[i++] = position;
};

"Hello World!".split("").forEach((char, index) => {
  writeCharToScreen(char, index);
});

writableBytes[i++] = instructions.HLT;

cpu.run();
