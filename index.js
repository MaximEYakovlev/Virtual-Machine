const createMemory = require("./create-memory");
const CPU = require("./cpu");
const inctructions = require("./instructions");

const IP = 0;
const ACC = 1;
const R1 = 2;
const R2 = 3;

const memory = createMemory(256 * 256);
const writableBytes = new Uint8Array(memory.buffer);

const cpu = new CPU(memory);

let i = 0;

writableBytes[i++] = inctructions.MOV_LIT_REG;
writableBytes[i++] = 0x12; // 0x1234
writableBytes[i++] = 0x34;
writableBytes[i++] = R1;

writableBytes[i++] = inctructions.MOV_LIT_REG;
writableBytes[i++] = 0xab; // 0xABCD
writableBytes[i++] = 0xcd;
writableBytes[i++] = R2;

writableBytes[i++] = inctructions.ADD_REG_REG;
writableBytes[i++] = R1;
writableBytes[i++] = R2;

writableBytes[i++] = inctructions.MOV_REG_MEM;
writableBytes[i++] = ACC;
writableBytes[i++] = 0x01;
writableBytes[i++] = 0x00; // 0x0100

cpu.debug();
cpu.viewMemoryAt(cpu.getRegister("ip"));
cpu.viewMemoryAt(0x0100);

cpu.step();
cpu.debug();
cpu.viewMemoryAt(cpu.getRegister("ip"));
cpu.viewMemoryAt(0x0100);

cpu.step();
cpu.debug();
cpu.viewMemoryAt(cpu.getRegister("ip"));
cpu.viewMemoryAt(0x0100);

cpu.step();
cpu.debug();
cpu.viewMemoryAt(cpu.getRegister("ip"));
cpu.viewMemoryAt(0x0100);

cpu.step();
cpu.debug();
cpu.viewMemoryAt(cpu.getRegister("ip"));
cpu.viewMemoryAt(0x0100);
