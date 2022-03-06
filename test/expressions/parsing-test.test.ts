import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';

import { tstables } from '../../src/module/tablesmith/tstables';

let filename: string;
let simpleTable: string;

describe('{Find~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{Find~2,One,12345One}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{Find~2,One,12345One}',
    );
  });

  it('finds first match', async () => {
    simpleTable = ':Start\n1,{Find~2,One,12345One}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('6');
  });
  it('start is first char to check', async () => {
    simpleTable = ':Start\n1,{Find~6,One,12345OneOne}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('6');
  });

  it('uses start', async () => {
    simpleTable = ':Start\n1,{Find~7,One,12345OneOne}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('9');
  });

  it('not found 0', async () => {
    simpleTable = ':Start\n1,{Find~10,One,12345OneOne}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('0');
  });
});

describe('{Replace~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{Replace~a,@,textatext}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{Replace~a,@,textatext}',
    );
  });

  it('replaces matches', async () => {
    simpleTable = ':Start\n1,{Replace~aa,@@,text aa aa text}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('text @@ @@ text');
  });
  it('no match, nothing changes', async () => {
    simpleTable = ':Start\n1,{Replace~bb,@@,text aa aa text}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('text aa aa text');
  });
});

describe('{Trim~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{Trim~    textatext    }\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Trim~textatext    }');
  });

  it('trims', async () => {
    simpleTable = ':Start\n1,{Trim~    textatext    }\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('textatext');
  });
});

describe('{Length~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parses correct', async () => {
    simpleTable = ':Start\n1,{Length~123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Length~123456789}');
  });

  it('returns length', async () => {
    simpleTable = ':Start\n1,{Length~123456789}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toBe('9');
  });
});
