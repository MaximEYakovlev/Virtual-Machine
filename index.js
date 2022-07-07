const readline = require("readline");
const createMemory = require("./create-memory");
const CPU = require("./cpu");
const instructions = require("./instructions");

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

const memory = createMemory(256 * 256);
const writableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(memory);

let i = 0;

cpu.debug();
cpu.viewMemoryAt(cpu.getRegister("ip"));
cpu.viewMemoryAt(0xffff - 1 - 6);

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout,
});

rl.on("line", () => {
  cpu.step();
  cpu.debug();
  cpu.viewMemoryAt(cpu.getRegister("ip"));
  cpu.viewMemoryAt(0xffff - 1 - 6);
});
