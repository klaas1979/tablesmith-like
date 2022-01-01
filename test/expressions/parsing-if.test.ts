import { tablesmith } from '../../src/module/tablesmithinstance';

let filename: string;
let simpleTable: string;

describe('Parsing {If~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('expression representation uses correct function name If', () => {
    simpleTable = '\n:Start\n1,{If~1=1?true/false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{If~1=1?true/false}',
    );
  });

  it('simple if evaluation => true', () => {
    simpleTable = '\n:Start\n1,{If~1=1?true/false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('true');
  });

  it('simple if evaluation => false', () => {
    simpleTable = '\n:Start\n1,{If~2=1?true/false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('false');
  });

  it('boolean expression operator as Functions', () => {
    simpleTable = '\n:Start\n1,{If~{Dice~1d{Calc~1}}=1?true/false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('true');
  });

  it('boolean expression operator with variables', () => {
    simpleTable = '%var%,1\n:Start\n1,{If~%var%=1?true/false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('true');
  });

  it('result with mixed expressions', () => {
    simpleTable = '%var%,text\n:Start\n1,{If~1=1?true {Calc~1} %var%/false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('true 1 text');
  });

  it('nested ifs', () => {
    simpleTable = ':Start\n1,{If~1=1?{If~2=1?nested true/nested false}/false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('nested false');
  });

  it('false value may be omitted -> empty string if false', () => {
    simpleTable = '\n:Start\n1,{If~1=2?true/}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
  });

  it('false value separator may be omitted', () => {
    simpleTable = '\n:Start\n1,{If~1=2?true}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
  });
});

describe('Parsing {IIf~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('expression representation uses correct function name IIf', () => {
    simpleTable = '\n:Start\n1,{IIf~1=1?true:false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{IIf~1=1?true:false}',
    );
  });

  it('simple if evaluation', () => {
    simpleTable = '\n:Start\n1,{IIf~1=1?true:false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('true');
  });

  it('false value may be omitted -> empty string if false', () => {
    simpleTable = '\n:Start\n1,{IIf~1=2?true:}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
  });

  it('false value separator may be omitted', () => {
    simpleTable = '\n:Start\n1,{IIf~1=2?true}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
  });
});

describe('{If~/IIf~ operators', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('1<2', () => {
    simpleTable = ':Start\n1,{If~1<2?true/false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('true');
  });

  it('1<1', () => {
    simpleTable = ':Start\n1,{If~2<1?true/false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('false');
  });
  it('1>1', () => {
    simpleTable = ':Start\n1,{If~1>1?true/false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('false');
  });

  it('2>1', () => {
    simpleTable = ':Start\n1,{If~2>1?true/false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('true');
  });
  it('1>=2', () => {
    simpleTable = ':Start\n1,{If~1>=2?true/false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('false');
  });

  it('1>=1', () => {
    simpleTable = ':Start\n1,{If~2>=1?true/false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('true');
  });

  it('2<=1', () => {
    simpleTable = ':Start\n1,{If~2<=1?true/false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('false');
  });

  it('1<=1', () => {
    simpleTable = ':Start\n1,{If~1<=1?true/false}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('true');
  });
});
