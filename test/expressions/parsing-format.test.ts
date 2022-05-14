import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';

import { tstables } from '../../src/module/tablesmith/tstables';

let filename: string;
let simpleTable: string;

describe('Special chars escaping', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('escaped chars result in correct expression', () => {
    simpleTable = ':Start\n1,/%/[/]/{/}/\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('/%/[/]/{/}/');
  });

  it('/% results in %', async () => {
    simpleTable = ':Start\n1,/%/%\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('%%');
  });

  it('/[ results in [', async () => {
    simpleTable = ':Start\n1,/[/[\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('[[');
  });

  it('/] results in ]', async () => {
    simpleTable = ':Start\n1,/]/]\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe(']]');
  });
  it('/ without char to escape results in /', async () => {
    simpleTable = ':Start\n1,/%/\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('%/');
  });

  it('/ without char can be chained', async () => {
    simpleTable = ':Start\n1,/%/// other\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('%/// other');
  });
});

describe('Parsing {Bold~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('bold expression correct simple text', async () => {
    simpleTable = ':Start\n1,{Bold~One}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Bold~One}');
  });

  it('bold expressions correct with single %var%', async () => {
    simpleTable = '%var%,1\n:Start\n1,{Bold~One=%var%}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Bold~One=%var%}');
  });
  it('text with b tags', async () => {
    simpleTable = ':Start\n1,{Bold~One}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('<b>One</b>');
  });

  it('nested expression with b tags', async () => {
    simpleTable = ':Start\n1,{Bold~{Calc~4}[other]}\n:other\n1,value\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('<b>4value</b>');
  });
});

describe('{Italic~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parsing correct', async () => {
    simpleTable = ':Start\n1,{Italic~One}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Italic~One}');
  });

  it('text with em tags', async () => {
    simpleTable = ':Start\n1,{Italic~One}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('<em>One</em>');
  });
});

describe('{Picture~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parsing correct', async () => {
    simpleTable = ':Start\n1,{Picture~path.png}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Picture~path.png}');
  });

  it('text with img tag', async () => {
    simpleTable = ':Start\n1,{Picture~path.png}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('<img src="path.png" />');
  });
});

describe('Parsing {Line~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('can be split over many lines', async () => {
    simpleTable = ':Start\n1,One{ \n_ Line~ \n_ center \n_ , \n_ 100 \n_ } \n_ Two\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('One<br/> Two');
  });

  it('Line expression format correct', async () => {
    simpleTable = ':Start\n1,One{Line~center,100}Two\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      'One{Line~center,100%}Two',
    );
  });
  it('for Group with Line formats html', async () => {
    simpleTable = ':Start\n1,One{Line~center,100}Two\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('One<br/>Two');
  });
});

describe('{Color~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correctly', async () => {
    simpleTable = ':Start\n1,{Color~red,100}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Color~red,100}');
  });
  it('adds span with style and color', async () => {
    simpleTable = ':Start\n1,{Color~red,100}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('<span style="color: red">100</span>');
  });
});
