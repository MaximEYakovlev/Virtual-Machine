const createMemory = require("./create-memory");
const CPU = require("./cpu");
const MemoryMapper = require("./memory-mapper.js");

const MM = new MemoryMapper();

const dataViewMethods = ["getUint8", "getUint16", "setUint8", "setUint16"];

const createBankedMemory = (n, bankSize, cpu) => {
  const bankBuffers = Array.from(
    { length: n },
    () => new ArrayBuffer(bankSize)
  );
  const banks = bankBuffers.map((ab) => new DataView(ab));

  const forwardToDataView =
    (name) =>
    (...args) => {
      const bankIndex = cpu.getRegister("mb") % n;
      const memoryBankToUse = banks[bankIndex];
      return memoryBankToUse[name](...args);
    };

  const interface = dataViewMethods.reduce((dvOut, fnName) => {
    dvOut[fnName] = forwardToDataView(fnName);
    return dvOut;
  }, {});
  return interface;
};
