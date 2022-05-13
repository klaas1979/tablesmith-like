import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';
import { tstables } from '../../src/module/tablesmith/tstables';

let filename: string;
let simpleTable: string;

describe('Parsing {And~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('expression representation uses correct function name And', () => {
    simpleTable = ':Start\n1,{And~1=1,2=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{And~1=1,2=2}');
  });

  it('with vars', async () => {
    simpleTable = '%c%,4\n%p%,6\n%n%,3\n:Start\n1,{AND~%c%!=%n%,%c%!=%p%}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });

  it('sub expression error => -1', async () => {
    simpleTable = ':Start\n1,{And~[missingGroup]=1,2=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('-1');
  });

  it('true, true => 1', async () => {
    simpleTable = ':Start\n1,{And~1=1,2=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });

  it('true, false => 0', async () => {
    simpleTable = ':Start\n1,{And~1=1,2=3}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('0');
  });

  it('false, true => 0', async () => {
    simpleTable = ':Start\n1,{And~1=2,2=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('0');
  });

  it('false, false => 0', async () => {
    simpleTable = ':Start\n1,{And~1=2,2=3}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('0');
  });
});

describe('Parsing {Or~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('expression representation uses correct function name Or', () => {
    simpleTable = ':Start\n1,{Or~1=1,2=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Or~1=1,2=2}');
  });

  it('sub expression error => -1', async () => {
    simpleTable = ':Start\n1,{Or~[missingGroup]=1,2=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('-1');
  });

  it('true, true => 1', async () => {
    simpleTable = ':Start\n1,{Or~1=1,2=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });

  it('true, false => 1', async () => {
    simpleTable = ':Start\n1,{Or~1=1,2=3}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });

  it('false, true => 1', async () => {
    simpleTable = ':Start\n1,{Or~1=2,2=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });

  it('false, false => 0', async () => {
    simpleTable = ':Start\n1,{Or~1=2,2=3}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('0');
  });
});

describe('Parsing {Xor~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('expression representation uses correct function name Xor', () => {
    simpleTable = ':Start\n1,{Xor~1=1,2=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Xor~1=1,2=2}');
  });

  it('sub expression error => -1', async () => {
    simpleTable = ':Start\n1,{Xor~[missingGroup]=1,2=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('-1');
  });

  it('true, true => 1', async () => {
    simpleTable = ':Start\n1,{Xor~1=1,2=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('0');
  });

  it('true, false => 1', async () => {
    simpleTable = ':Start\n1,{Xor~1=1,2=3}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });

  it('false, true => 1', async () => {
    simpleTable = ':Start\n1,{Xor~1=2,2=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });

  it('false, false => 0', async () => {
    simpleTable = ':Start\n1,{Xor~1=2,2=3}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('0');
  });

  it('can have 2+ arguments all true => 0', async () => {
    simpleTable = ':Start\n1,{Xor~1=1,2=2,3=3,4=4}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('0');
  });

  it('can have 2+ arguments single true => 1', async () => {
    simpleTable = ':Start\n1,{Xor~1=1,2=3,3=4,4=5}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });
});

describe('{Or~/And~/Xor~ comparison operator test', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('1<2', async () => {
    simpleTable = ':Start\n1,{Or~1<2,1=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });

  it('1<1', async () => {
    simpleTable = ':Start\n1,{Or~1<1,1=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('0');
  });
  it('1>1', async () => {
    simpleTable = ':Start\n1,{Or~1>1,1=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('0');
  });

  it('2>1', async () => {
    simpleTable = ':Start\n1,{Or~2>1,1=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });
  it('1>=2', async () => {
    simpleTable = ':Start\n1,{Or~1>=2,1=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('0');
  });

  it('1>=1', async () => {
    simpleTable = ':Start\n1,{Or~1>=1,1=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });

  it('2<=1', async () => {
    simpleTable = ':Start\n1,{Or~2<=1,1=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('0');
  });

  it('1<=1', async () => {
    simpleTable = ':Start\n1,{Or~1<=1,1=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });

  it('can have 2+ arguments', async () => {
    simpleTable = ':Start\n1,{Or~1<2,1=2,1<2,1=2,1<2,1=2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });
});

describe('Parsing {IsNumber~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('expression representation uses correct function name IsNumber', () => {
    simpleTable = ':Start\n1,{IsNumber~20}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{IsNumber~20}');
  });

  it('integer => 1', async () => {
    simpleTable = ':Start\n1,{IsNumber~20}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });

  it('float => 1', async () => {
    simpleTable = ':Start\n1,{IsNumber~20.212}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });

  it('text => 0', async () => {
    simpleTable = ':Start\n1,{IsNumber~nonumber}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('0');
  });
});
