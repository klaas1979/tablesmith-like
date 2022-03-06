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
