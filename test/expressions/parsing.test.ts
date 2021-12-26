import { tablesmith } from '../../src/module/tablesmithinstance';

let filename: string;
let simpleTable: string;

describe('Parsing {Dice~}', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('3d6+3 roll with modifier', () => {
    simpleTable = ':name\n1,{Dice~3d6+3}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('name')?.ranges[0]?.getExpression();
    expect(result).toBe('3d6+3');
  });

  it('1d4+3d6+4d8 chained rolls', () => {
    simpleTable = ':name\n1,{Dice~1d4+3d6+4d8}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('name')?.ranges[0]?.getExpression();
    expect(result).toBe('1d4+3d6+4d8');
  });

  it('1+2 addition', () => {
    simpleTable = ':name\n1,{Dice~1+2}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('name')?.ranges[0]?.getExpression();
    expect(result).toBe('1+2');
    expect(tablesmith.evaluate(`[${filename}.name=1]`)).toBe('3');
  });

  it('2-1 subtraction', () => {
    simpleTable = ':name\n1,{Dice~2-1}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('name')?.ranges[0]?.getExpression();
    expect(result).toBe('2-1');
    expect(tablesmith.evaluate(`[${filename}.name=1]`)).toBe('1');
  });

  it('3*6 multiplication', () => {
    simpleTable = ':name\n1,{Dice~3*6}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('name')?.ranges[0]?.getExpression();
    expect(result).toBe('3*6');
    expect(tablesmith.evaluate(`[${filename}.name=1]`)).toBe('18');
  });

  it('18/6 division', () => {
    simpleTable = ':name\n1,{Dice~18/6}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('name')?.ranges[0]?.getExpression();
    expect(result).toBe('18/6');
    expect(tablesmith.evaluate(`[${filename}.name=1]`)).toBe('3');
  });

  it('((5+5)/10)d(10-9) brackets', () => {
    simpleTable = ':name\n1,{Dice~((5+5)/10)d(10-9)}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('name')?.ranges[0]?.getExpression();
    expect(result).toBe('((5+5)/10)d(10-9)');
    expect(tablesmith.evaluate(`[${filename}.name=1]`)).toBe('1');
  });
});

describe('Parsing {Calc~}', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('((5+5)/10)d(10-9) brackets', () => {
    simpleTable = ':name\n1,{Calc~((5+5)/10)d(10-9)}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('name')?.ranges[0]?.getExpression();
    expect(result).toBe('((5+5)/10)d(10-9)');
    expect(tablesmith.evaluate(`[${filename}.name=1]`)).toBe('1');
  });
});
