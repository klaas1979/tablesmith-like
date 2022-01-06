import { tablesmith } from '../../src/module/tablesmithinstance';

let filename: string;
let simpleTable: string;

describe('Parsing {LastRoll~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
    simpleTable = ':name\n1,One\n2,Two\n';
  });

  it('returns roll result for the group it is called from', () => {
    simpleTable = ':Start\n1,One{LastRoll~}[Other=2]\n:Other\n1,notused\n2,Two{LastRoll~}';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.evaluate(`[${filename}]`);
    expect(result).toBe('One1Two2');
  });
});

describe('Parsing {MinVal~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('min value from first range', () => {
    simpleTable = ':Start\n1-49,{MinVal~}\n50-100,{MinVal~}';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.evaluate(`[${filename}]`);
    expect(result).toBe('1');
  });
});
describe('Parsing {MaxVal~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('max value from first range', () => {
    simpleTable = ':Start\n1-49,{MaxVal~}\n50-100,{MaxVal~}';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.evaluate(`[${filename}]`);
    expect(result).toBe('100');
  });
});

describe('Parsing {Reset~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('max value from first range', () => {
    simpleTable = ':Start\n1,{Reset~other}\n:!other\n1,One\n2,One\n';
    tablesmith.addTable(filename, simpleTable);
    const group = tablesmith.getLastTSTable().groupForName('other');
    const firstRange = group?.firstRange();
    const lastRange = group?.lastRange();
    firstRange?.lockout();
    lastRange?.lockout();
    tablesmith.evaluate(`[${filename}]`);
    expect(firstRange?.isTaken()).toBeFalsy();
    expect(lastRange?.isTaken()).toBeFalsy();
  });
});
