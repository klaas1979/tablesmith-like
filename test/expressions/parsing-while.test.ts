import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';
import { tstables } from '../../src/module/tablesmith/tstables';

let filename: string;
let simpleTable: string;

describe('Parsing {While~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });
  it('while expressions correct with BooleanComparison', () => {
    simpleTable = '%var%,0\n:Start\n1,{While~%var%<5,|var+1|x}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{While~%var%<5,|var+1|x}',
    );
  });

  it('while expressions correct with single %var%', () => {
    simpleTable = '%var%,1\n:Start\n1,{While~%var%,|var=0|body}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{While~%var%,|var=0|body}',
    );
  });

  it('while with BooleanComparision', async () => {
    simpleTable = '%var%,0\n:Start\n1,{While~%var%<5,|var+1|x}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('xxxxx');
  });

  it('while with %variable%', async () => {
    simpleTable = '%var%,1\n:Start\n1,{While~%var%,|var=0|body}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('body');
  });

  it('nesting whiles', async () => {
    simpleTable = '%var%,2,%var2%,0\n:Start\n1,{While~%var%,{While~%var2%<3,|var2+1|.}|var-1||var2=0|x}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('...x...x');
  });
});
