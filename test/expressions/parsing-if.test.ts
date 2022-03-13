/* eslint-disable jest/expect-expect */
import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';
import { tstables } from '../../src/module/tablesmith/tstables';

let filename: string;
let simpleTable: string;

describe('Parsing {If~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('expression representation uses correct function name If', () => {
    simpleTable = '\n:Start\n1,{If~1=1?true/false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{If~1=1?true/false}');
  });

  it('simple if evaluation => true', async () => {
    simpleTable = '\n:Start\n1,{If~1=1?true/false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('true');
  });

  it('simple if evaluation => false', async () => {
    simpleTable = '\n:Start\n1,{If~2=1?true/false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('false');
  });

  it('boolean expression operator as Functions', async () => {
    simpleTable = '\n:Start\n1,{If~{Dice~1d{Calc~1}}=1?true/false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('true');
  });

  it('boolean expression operator with variables', async () => {
    simpleTable = '%var%,1\n:Start\n1,{If~%var%=1?true/false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('true');
  });

  it('values with variable set', async () => {
    simpleTable = '%var%,1\n%res%,default\n:Start\n1,{If~%var%=1?|res=done|/false}%res%\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('done');
  });

  it('result with mixed expressions', async () => {
    simpleTable = '%var%,text\n:Start\n1,{If~1=1?true {Calc~1} %var%/false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('true 1 text');
  });

  it('nested ifs', async () => {
    simpleTable = ':Start\n1,{If~1=1?{If~2=1?nested true/nested false}/false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('nested false');
  });

  it('false value may be omitted -> empty string if false', async () => {
    simpleTable = '\n:Start\n1,{If~1=2?true/}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('');
  });

  it('false value separator may be omitted', async () => {
    simpleTable = '\n:Start\n1,{If~1=2?true}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('');
  });
});

describe('Parsing {IIf~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('expression representation uses correct function name IIf', () => {
    simpleTable = '\n:Start\n1,{IIf~1=1?true:false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{IIf~1=1?true:false}');
  });

  it('simple if evaluation', async () => {
    simpleTable = '\n:Start\n1,{IIf~1=1?true:false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('true');
  });

  it('false value may be omitted -> empty string if false', async () => {
    simpleTable = '\n:Start\n1,{IIf~1=2?true:}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('');
  });

  it('false value separator may be omitted', async () => {
    simpleTable = '\n:Start\n1,{IIf~1=2?true}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('');
  });
});

describe('{If~/IIf~ operators', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('1<2', async () => {
    simpleTable = ':Start\n1,{If~1<2?true/false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('true');
  });

  it('1<1', async () => {
    simpleTable = ':Start\n1,{If~2<1?true/false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('false');
  });
  it('1>1', async () => {
    simpleTable = ':Start\n1,{If~1>1?true/false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('false');
  });

  it('2>1', async () => {
    simpleTable = ':Start\n1,{If~2>1?true/false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('true');
  });
  it('1>=2', async () => {
    simpleTable = ':Start\n1,{If~1>=2?true/false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('false');
  });

  it('1>=1', async () => {
    simpleTable = ':Start\n1,{If~2>=1?true/false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('true');
  });

  it('2<=1', async () => {
    simpleTable = ':Start\n1,{If~2<=1?true/false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('false');
  });

  it('1<=1', async () => {
    simpleTable = ':Start\n1,{If~1<=1?true/false}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('true');
  });
});
