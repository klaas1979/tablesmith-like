import { tablesmith } from '../../src/module/tablesmithinstance';

let filename: string;
let simpleTable: string;

describe('Parsing {And~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('expression representation uses correct function name And', () => {
    simpleTable = ':Start\n1,{And~1=1,2=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{And~1=1,2=2}');
  });

  it('sub expression error => -1', () => {
    simpleTable = ':Start\n1,{And~[missingGroup]=1,2=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('-1');
  });

  it('true, true => 1', () => {
    simpleTable = ':Start\n1,{And~1=1,2=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });

  it('true, false => 0', () => {
    simpleTable = ':Start\n1,{And~1=1,2=3}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('0');
  });

  it('false, true => 0', () => {
    simpleTable = ':Start\n1,{And~1=2,2=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('0');
  });

  it('false, false => 0', () => {
    simpleTable = ':Start\n1,{And~1=2,2=3}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('0');
  });
});

describe('Parsing {Or~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('expression representation uses correct function name Or', () => {
    simpleTable = ':Start\n1,{Or~1=1,2=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Or~1=1,2=2}');
  });

  it('sub expression error => -1', () => {
    simpleTable = ':Start\n1,{Or~[missingGroup]=1,2=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('-1');
  });

  it('true, true => 1', () => {
    simpleTable = ':Start\n1,{Or~1=1,2=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });

  it('true, false => 1', () => {
    simpleTable = ':Start\n1,{Or~1=1,2=3}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });

  it('false, true => 1', () => {
    simpleTable = ':Start\n1,{Or~1=2,2=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });

  it('false, false => 0', () => {
    simpleTable = ':Start\n1,{Or~1=2,2=3}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('0');
  });
});

describe('{Or~/And~ operators', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('1<2', () => {
    simpleTable = ':Start\n1,{Or~1<2,1=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });

  it('1<1', () => {
    simpleTable = ':Start\n1,{Or~1<1,1=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('0');
  });
  it('1>1', () => {
    simpleTable = ':Start\n1,{Or~1>1,1=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('0');
  });

  it('2>1', () => {
    simpleTable = ':Start\n1,{Or~2>1,1=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });
  it('1>=2', () => {
    simpleTable = ':Start\n1,{Or~1>=2,1=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('0');
  });

  it('1>=1', () => {
    simpleTable = ':Start\n1,{Or~1>=1,1=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });

  it('2<=1', () => {
    simpleTable = ':Start\n1,{Or~2<=1,1=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('0');
  });

  it('1<=1', () => {
    simpleTable = ':Start\n1,{Or~1<=1,1=2}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });
});
