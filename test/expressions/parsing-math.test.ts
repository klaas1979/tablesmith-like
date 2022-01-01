import { tablesmith } from '../../src/module/tablesmithinstance';

let filename: string;
let simpleTable: string;

describe('Parsing {Dice~}', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('3d6+3 roll with modifier', () => {
    simpleTable = ':Start\n1,{Dice~3d6+3}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~3d6+3}');
  });

  it('1d4+3d6+4d8 chained rolls', () => {
    simpleTable = ':Start\n1,{Dice~1d4+3d6+4d8}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~1d4+3d6+4d8}');
  });

  it('1+2 addition', () => {
    simpleTable = ':Start\n1,{Dice~1+2}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~1+2}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('3');
  });

  it('2-1 subtraction', () => {
    simpleTable = ':Start\n1,{Dice~2-1}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~2-1}');
    expect(tablesmith.evaluate(`[${filename}.]`)).toBe('1');
  });

  it('3*6 multiplication', () => {
    simpleTable = ':Start\n1,{Dice~3*6}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~3*6}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('18');
  });

  it('18/6 division', () => {
    simpleTable = ':Start\n1,{Dice~18/6}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~18/6}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('3');
  });

  it('((5+5)/10)d(10-9) brackets', () => {
    simpleTable = ':Start\n1,{Dice~((5+5)/10)d(10-9)}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~((5+5)/10)d(10-9)}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });
});

describe('Parsing {Calc~}', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('((5+5)/10) brackets', () => {
    simpleTable = ':Start\n1,{Calc~((5+5)/10)}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Calc~((5+5)/10)}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });

  it('((5+5)/10)d(10-9) brackets', () => {
    simpleTable = ':Start\n1,{Calc~((5+5)/10)d(10-9)}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Calc~((5+5)/10)d(10-9)}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });
});

describe('Parsing nested Math in Dice~ or Calc~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('{Dice~{Dice~3d1}d{Dice~1d1}}', () => {
    simpleTable = ':Start\n1,{Dice~{Dice~3d1}d{Dice~1d1}}\n';
    tablesmith.addTable(filename, simpleTable);
    const term = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(term).toBe('{Dice~{Dice~3d1}d{Dice~1d1}}');
    const total = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getText();
    expect(total).toBe('3');
  });
});
