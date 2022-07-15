const MOV_LIT_REG = 0x10;
const MOV_REG_REG = 0x11;
const MOV_REG_MEM = 0x12;
const MOV_MEM_REG = 0x13;
const MOV_LIT_MEM = 0x1b;
const MOV_REG_PTR_REG = 0x1c;
const MOV_LIT_OFF_REG = 0x1d;

const ADD_REG_REG = 0x14;
const ADD_LIT_REG = 0x3f;
const SUB_LIT_REG = 0x16;
const SUB_REG_LIT = 0x1e;
const SUB_REG_REG = 0x1f;
const INC_REG = 0x35;
const DEC_REG = 0x36;
const MUL_LIT_REG = 0x20;
const MUL_REG_REG = 0x21;

const JMP_NOT_EQ = 0x15;
const PSH_LIT = 0x17;
const PSH_REG = 0x18;
const POP = 0x1a;
const CAL_LIT = 0x5e;
const CAL_REG = 0x5f;
const RET = 0x60;
const HLT = 0xff;

module.exports = {
  MOV_LIT_REG,
  MOV_REG_REG,
  MOV_REG_MEM,
  MOV_MEM_REG,
  MOV_LIT_MEM,
  MOV_REG_PTR_REG,
  MOV_LIT_OFF_REG,
  ADD_REG_REG,
  ADD_LIT_REG,
  SUB_LIT_REG,
  SUB_REG_LIT,
  SUB_REG_REG,
  INC_REG,
  DEC_REG,
  MUL_LIT_REG,
  MUL_REG_REG,
  JMP_NOT_EQ,
  PSH_LIT,
  PSH_REG,
  POP,
  CAL_LIT,
  CAL_REG,
  RET,
  HLT,
};
