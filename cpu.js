const createMemory = require("./create-memory");
const instructions = require("./instructions");

class CPU {
  constructor(memory) {
    this.memory = memory;

    this.registerNames = [
      "ip",
      "acc",
      "r1",
      "r2",
      "r3",
      "r4",
      "r5",
      "r6",
      "r7",
      "r8",
      "sp",
      "fp",
    ];

    this.registers = createMemory(this.registerNames.length * 2);

    this.registerMap = this.registerNames.reduce((map, name, i) => {
      map[name] = i * 2;
      return map;
    }, {});

    this.setRegister("sp", 0xffff - 1);
    this.setRegister("fp", 0xffff - 1);

    this.stackFrameSize = 0;
  }

  debug() {
    this.registerNames.forEach((name) => {
      console.log(
        `${name}: 0x${this.getRegister(name).toString(16).padStart(4, "0")}`
      );
    });
    console.log();
  }

  viewMemoryAt(address, n = 8) {
    // 0x0f01: 0x04 0x05 0xA3 0xFE 0x13 0x0D 0x44 0x0F ...
    const nextNBytes = Array.from({ length: n }, (_, i) =>
      this.memory.getUint8(address + i)
    ).map((v) => `0x${v.toString(16).padStart(2, "0")}`);

    console.log(
      `0x${address.toString(16).padStart(4, "0")}: ${nextNBytes.join(" ")}`
    );
  }

  getRegister(name) {
    if (!(name in this.registerMap)) {
      throw new Error(`getRegister: No such register '${name}'`);
    }
    return this.registers.getUint16(this.registerMap[name]);
  }

  setRegister(name, value) {
    if (!(name in this.registerMap)) {
      throw new Error(`setRegister: No such register '${name}'`);
    }
    return this.registers.setUint16(this.registerMap[name], value);
  }

  fetch() {
    const nextInstructionAddress = this.getRegister("ip");
    const instruction = this.memory.getUint8(nextInstructionAddress);
    this.setRegister("ip", nextInstructionAddress + 1);
    return instruction;
  }

  fetch16() {
    const nextInstructionAddress = this.getRegister("ip");
    const instruction = this.memory.getUint16(nextInstructionAddress);
    this.setRegister("ip", nextInstructionAddress + 2);
    return instruction;
  }

  push(value) {
    const spAddress = this.getRegister("sp");
    this.memory.setUint16(spAddress, value);
    this.setRegister("sp", spAddress - 2);
    this.stackFrameSize += 2;
  }

  pop() {
    const nextSpAddress = this.getRegister("sp") + 2;
    this.setRegister("sp", nextSpAddress);
    this.stackFrameSize -= 2;
    return this.memory.getUint16(nextSpAddress);
  }

  pushState() {
    this.push(this.getRegister("r1"));
    this.push(this.getRegister("r2"));
    this.push(this.getRegister("r3"));
    this.push(this.getRegister("r4"));
    this.push(this.getRegister("r5"));
    this.push(this.getRegister("r6"));
    this.push(this.getRegister("r7"));
    this.push(this.getRegister("r8"));
    this.push(this.getRegister("ip"));
    this.push(this.stackFrameSize + 2);

    this.setRegister("fp", this.getRegister("sp"));
    this.stackFrameSize = 0;
  }

  popState() {
    const framePointerAddress = this.getRegister("fp");
    this.setRegister("sp", framePointerAddress);

    this.stackFrameSize = this.pop();
    const stackFrameSize = this.stackFrameSize;

    this.setRegister("ip", this.pop());
    this.setRegister("r8", this.pop());
    this.setRegister("r7", this.pop());
    this.setRegister("r6", this.pop());
    this.setRegister("r5", this.pop());
    this.setRegister("r4", this.pop());
    this.setRegister("r3", this.pop());
    this.setRegister("r2", this.pop());
    this.setRegister("r1", this.pop());

    const nArgs = this.pop();
    for (let i = 0; i < nArgs; i++) {
      this.pop();
    }

    this.setRegister("fp", framePointerAddress + stackFrameSize);
  }

  fetchRegisterIndex() {
    return (this.fetch() % this.registerNames.length) * 2;
  }

  execute(instruction) {
    switch (instruction) {
      // Move literal into register
      case instructions.MOV_LIT_REG: {
        const literal = this.fetch16();
        const register = this.fetchRegisterIndex();
        this.registers.setUint16(register, literal);
        return;
      }

      // Move register to register
      case instructions.MOV_REG_REG: {
        const registerFrom = this.fetchRegisterIndex();
        const registerTo = this.fetchRegisterIndex();
        const value = this.registers.getUint16(registerFrom);
        this.registers.setUint16(registerTo, value);
        return;
      }

      // Move register to memory
      case instructions.MOV_REG_MEM: {
        const registerFrom = this.fetchRegisterIndex();
        const address = this.fetch16();
        const value = this.registers.getUint16(registerFrom);
        this.memory.setUint16(address, value);
        return;
      }

      // Move memory to register
      case instructions.MOV_MEM_REG: {
        const address = this.fetch16();
        const registerTo = this.fetchRegisterIndex();
        const value = this.memory.getUint16(address);
        this.registers.setUint16(registerTo, value);
        return;
      }

      // Move literal to memory
      case instructions.MOV_LIT_MEM: {
        const value = this.fetch16();
        const address = this.fetch16();
        this.memory.setUint16(address, value);
        return;
      }

      // Move register* to register
      case instructions.MOV_REG_PTR_REG: {
        const r1 = this.fetchRegisterIndex();
        const r2 = this.fetchRegisterIndex();
        const ptr = this.registers.getUint16(r1);
        const value = this.memory.getUint16(ptr);
        this.registers.setUint16(r2, value);
        return;
      }

      // Move value at [literal + register] to register
      case instructions.MOV_LIT_OFF_REG: {
        const baseAddress = this.fetch16();
        const r1 = this.fetchRegisterIndex();
        const r2 = this.fetchRegisterIndex();
        const offset = this.registers.getUint16(r1);

        const value = this.memory.getUint16(baseAddress + offset);
        this.registers.setUint16(r2, value);
        return;
      }

      // Add register to register
      case instructions.ADD_REG_REG: {
        const r1 = this.fetchRegisterIndex();
        const r2 = this.fetchRegisterIndex();
        const registerValue1 = this.registers.getUint16(r1);
        const registerValue2 = this.registers.getUint16(r2);
        this.setRegister("acc", registerValue1 + registerValue2);
        return;
      }

      // Add literal to register
      case instructions.ADD_LIT_REG: {
        const literal = this.fetch16();
        const r1 = this.fetchRegisterIndex();
        const registerValue = this.registers.getUint16(r1);
        this.setRegister("acc", literal + registerValue);
        return;
      }

      // Subtract literal from register value
      case instructions.SUB_LIT_REG: {
        const literal = this.fetch16();
        const r1 = this.fetchRegisterIndex();
        const registerValue = this.registers.getUint16(r1);
        const res = registerValue - literal;
        this.setRegister("acc", res);
        return;
      }

      // Subtract register value from literal
      case instructions.SUB_REG_LIT: {
        const r1 = this.fetchRegisterIndex();
        const literal = this.fetch16();
        const registerValue = this.registers.getUint16(r1);
        const res = literal - registerValue;
        this.setRegister("acc", res);
        return;
      }

      // Subtract register value from register value
      case instructions.SUB_REG_REG: {
        const r1 = this.fetchRegisterIndex();
        const r2 = this.fetchRegisterIndex();
        const registerValue1 = this.registers.getUint16(r1);
        const registerValue2 = this.registers.getUint16(r2);
        const res = registerValue1 - registerValue2;
        this.setRegister("acc", res);
        return;
      }

      // Multiply literal by register value
      case instructions.MUL_LIT_REG: {
        const literal = this.fetch16();
        const r1 = this.fetchRegisterIndex();
        const registerValue = this.registers.getUint16(r1);
        const res = literal * registerValue;
        this.setRegister("acc", res);
        return;
      }

      // Multiply register value by register value
      case instructions.MUL_REG_REG: {
        const r1 = this.fetchRegisterIndex();
        const r2 = this.fetchRegisterIndex();
        const registerValue1 = this.registers.getUint16(r1);
        const registerValue2 = this.registers.getUint16(r2);
        const res = registerValue1 * registerValue2;
        this.setRegister("acc", res);
        return;
      }

      // Increment value in register (in place)
      case instructions.INC_REG: {
        const r1 = this.fetchRegisterIndex();
        const oldValue = this.registers.getUint16(r1);
        const newValue = oldValue + 1;
        this.registers.setUint16(r1, newValue);
        return;
      }

      // Decrement value in register (in place)
      case instructions.DEC_REG: {
        const r1 = this.fetchRegisterIndex();
        const oldValue = this.registers.getUint16(r1);
        const newValue = oldValue - 1;
        this.registers.setUint16(r1, newValue);
        return;
      }

      // Left shift register by literal (in place)
      case instructions.LSF_REG_LIT: {
        const r1 = this.fetchRegisterIndex();
        const literal = this.fetch();
        const oldValue = this.registers.getUint16(r1);
        const res = oldValue << literal;
        this.registers.setUint16(r1, res);
        return;
      }

      // Left shift register by register (in place)
      case instructions.LSF_REG_REG: {
        const r1 = this.fetchRegisterIndex();
        const r2 = this.fetchRegisterIndex();
        const oldValue = this.registers.getUint16(r1);
        const shiftBy = this.registers.getUint16(r2);
        const res = oldValue << shiftBy;
        this.registers.setUint16(r1, res);
        return;
      }

      // Right shift register by literal (in place)
      case instructions.RSF_REG_LIT: {
        const r1 = this.fetchRegisterIndex();
        const literal = this.fetch();
        const oldValue = this.registers.getUint16(r1);
        const res = oldValue >> literal;
        this.registers.setUint16(r1, res);
        return;
      }

      // Right shift register by register (in place)
      case instructions.RSF_REG_REG: {
        const r1 = this.fetchRegisterIndex();
        const r2 = this.fetchRegisterIndex();
        const oldValue = this.registers.getUint16(r1);
        const shiftBy = this.registers.getUint16(r2);
        const res = oldValue >> shiftBy;
        this.registers.setUint16(r1, res);
        return;
      }

      // And register with literal
      case instructions.AND_REG_LIT: {
        const r1 = this.fetchRegisterIndex();
        const literal = this.fetch16();
        const registerValue = this.registers.getUint16(r1);

        const res = registerValue & literal;
        this.setRegister("acc", res);
        return;
      }

      // And register with register
      case instructions.AND_REG_REG: {
        const r1 = this.fetchRegisterIndex();
        const r2 = this.fetchRegisterIndex();
        const registerValue1 = this.registers.getUint16(r1);
        const registerValue2 = this.registers.getUint16(r2);

        const res = registerValue1 & registerValue2;
        this.setRegister("acc", res);
        return;
      }

      // Or register with literal
      case instructions.OR_REG_LIT: {
        const r1 = this.fetchRegisterIndex();
        const literal = this.fetch16();
        const registerValue = this.registers.getUint16(r1);

        const res = registerValue | literal;
        this.setRegister("acc", res);
        return;
      }

      // Or register with register
      case instructions.OR_REG_REG: {
        const r1 = this.fetchRegisterIndex();
        const r2 = this.fetchRegisterIndex();
        const registerValue1 = this.registers.getUint16(r1);
        const registerValue2 = this.registers.getUint16(r2);

        const res = registerValue1 | registerValue2;
        this.setRegister("acc", res);
        return;
      }

      // Xor register with literal
      case instructions.XOR_REG_LIT: {
        const r1 = this.fetchRegisterIndex();
        const literal = this.fetch16();
        const registerValue = this.registers.getUint16(r1);

        const res = registerValue ^ literal;
        this.setRegister("acc", res);
        return;
      }

      // Xor register with register
      case instructions.XOR_REG_REG: {
        const r1 = this.fetchRegisterIndex();
        const r2 = this.fetchRegisterIndex();
        const registerValue1 = this.registers.getUint16(r1);
        const registerValue2 = this.registers.getUint16(r2);

        const res = registerValue1 ^ registerValue2;
        this.setRegister("acc", res);
        return;
      }

      // Not (invert) register
      case instructions.NOT: {
        const r1 = this.fetchRegisterIndex();
        const registerValue = this.registers.getUint16(r1);

        const res = ~registerValue & 0xffff;
        this.setRegister("acc", res);
        return;
      }

      // Jump if literal not equal
      case instructions.JMP_NOT_EQ: {
        const value = this.fetch16();
        const address = this.fetch16();

        if (value !== this.getRegister("acc")) {
          this.setRegister("ip", address);
        }
        return;
      }

      // Jump if register not equal
      case instructions.JNE_REG: {
        const r1 = this.fetchRegisterIndex();
        const value = this.registers.getUint16(r1);
        const address = this.fetch16();

        if (value !== this.getRegister("acc")) {
          this.setRegister("ip", address);
        }
        return;
      }

      // Jump if literal equal
      case instructions.JEQ_LIT: {
        const value = this.fetch16();
        const address = this.fetch16();

        if (value === this.getRegister("acc")) {
          this.setRegister("ip", address);
        }
        return;
      }

      // Jump if register equal
      case instructions.JEQ_REG: {
        const r1 = this.fetchRegisterIndex();
        const value = this.registers.getUint16(r1);
        const address = this.fetch16();

        if (value === this.getRegister("acc")) {
          this.setRegister("ip", address);
        }
        return;
      }

      // Jump if literal less than
      case instructions.JLT_LIT: {
        const value = this.fetch16();
        const address = this.fetch16();

        if (value < this.getRegister("acc")) {
          this.setRegister("ip", address);
        }
        return;
      }

      // Jump if register less than
      case instructions.JLT_REG: {
        const r1 = this.fetchRegisterIndex();
        const value = this.registers.getUint16(r1);
        const address = this.fetch16();

        if (value < this.getRegister("acc")) {
          this.setRegister("ip", address);
        }
        return;
      }

      // Jump if literal greater than
      case instructions.JGT_LIT: {
        const value = this.fetch16();
        const address = this.fetch16();

        if (value > this.getRegister("acc")) {
          this.setRegister("ip", address);
        }
        return;
      }

      // Jump if register greater than
      case instructions.JGT_REG: {
        const r1 = this.fetchRegisterIndex();
        const value = this.registers.getUint16(r1);
        const address = this.fetch16();

        if (value > this.getRegister("acc")) {
          this.setRegister("ip", address);
        }
        return;
      }

      // Jump if literal less than or equal to
      case instructions.JLE_LIT: {
        const value = this.fetch16();
        const address = this.fetch16();

        if (value <= this.getRegister("acc")) {
          this.setRegister("ip", address);
        }
        return;
      }

      // Jump if register less than or equal to
      case instructions.JLE_REG: {
        const r1 = this.fetchRegisterIndex();
        const value = this.registers.getUint16(r1);
        const address = this.fetch16();

        if (value <= this.getRegister("acc")) {
          this.setRegister("ip", address);
        }
        return;
      }

      // Jump if literal greater than or equal to
      case instructions.JGE_LIT: {
        const value = this.fetch16();
        const address = this.fetch16();

        if (value >= this.getRegister("acc")) {
          this.setRegister("ip", address);
        }
        return;
      }

      // Jump if register greater than or equal to
      case instructions.JGE_REG: {
        const r1 = this.fetchRegisterIndex();
        const value = this.registers.getUint16(r1);
        const address = this.fetch16();

        if (value >= this.getRegister("acc")) {
          this.setRegister("ip", address);
        }
        return;
      }

      // Push Literal
      case instructions.PSH_LIT: {
        const value = this.fetch16();
        this.push(value);
        return;
      }

      // Push Register
      case instructions.PSH_REG: {
        const registerIndex = this.fetchRegisterIndex();
        this.push(this.registers.getUint16(registerIndex));
        return;
      }

      // Pop
      case instructions.POP: {
        const registerIndex = this.fetchRegisterIndex();
        const value = this.pop();
        this.registers.setUint16(registerIndex, value);
        return;
      }

      // Call literal
      case instructions.CAL_LIT: {
        const address = this.fetch16();
        this.pushState();
        this.setRegister("ip", address);
      }

      // Call register
      case instructions.CAL_REG: {
        const registerIndex = this.fetchRegisterIndex();
        const address = this.registers.getUint16(registerIndex);
        this.pushState();
        this.setRegister("ip", address);
        return;
      }

      // Return from subroutine
      case instructions.RET: {
        this.popState();
        return;
      }

      // Halt all computation
      case instructions.HLT: {
        return true;
      }
    }
  }

  step() {
    const instruction = this.fetch();
    return this.execute(instruction);
  }

  run() {
    const halt = this.step();
    if (!halt) {
      setImmediate(() => this.run());
    }
  }
}

module.exports = CPU;
