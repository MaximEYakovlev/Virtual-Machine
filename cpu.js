const createMemory = require("./create-memory");

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
    ];

    this.registers = createMemory(this.registerNames.length * 2);

    this.registerMap = this.registerNames.reduce((map, name, i) => {
      map[name] = i * 2;
      return map;
    }, {});
  }
}

module.exports = CPU;
