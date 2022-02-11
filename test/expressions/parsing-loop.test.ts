import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';
import { tstables } from '../../src/module/tablesmith/tstables';

let filename: string;
let simpleTable: string;

describe('Parsing {Loop~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });
  it('loop expressions correct with expression', () => {
    simpleTable = ':Start\n1,{Loop~{Dice~1d20},x}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Loop~{Dice~1d20},x}');
  });

  it('loop expressions correct with single %var%', () => {
    simpleTable = '%var%,1\n:Start\n1,{Loop~%var%,x}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Loop~%var%,x}');
  });

  it('with expression', async () => {
    simpleTable = '%var%,3\n:Start\n1,{Loop~{Calc~8-4},x}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('xxxx');
  });

  it('while with %variable%', async () => {
    simpleTable = '%var%,3\n:Start\n1,{Loop~%var%,x}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('xxx');
  });

  it('nesting loops', async () => {
    simpleTable = '%var%,3\n:Start\n1,{Loop~3,{Loop~3,.}x}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('...x...x...x');
  });
});
