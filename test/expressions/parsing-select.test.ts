import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';
import { tstables } from '../../src/module/tablesmith/tstables';

let filename: string;
let simpleTable: string;

describe('Parsing {Select~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });
  it('select expressions correct with simple tuples', () => {
    simpleTable = '%var%,\n:Start\n1,{Select~%var%,key1,value1,key2,value2,default}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{Select~%var%,key1,value1,key2,value2,default}',
    );
  });

  it('loop expressions correct with complex expressions', () => {
    simpleTable = '%var%,\n:Start\n1,{Select~%var%,[key1],{Calc~1*2},%key2%,value2,default}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{Select~%var%,[key1],{Calc~1*2},%key2%,value2,default}',
    );
  });

  it('retrieve first key', async () => {
    simpleTable = '%var%,key1\n:Start\n1,{Select~%var%,key1,value1,key2,value2,default}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('value1');
  });

  it('retrieve second key', async () => {
    simpleTable = '%var%,key2\n:Start\n1,{Select~%var%,key1,value1,key2,value2,default}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('value2');
  });

  it('get default for no match', async () => {
    simpleTable = '%var%,\n:Start\n1,{Select~%var%,key1,value1,key2,value2,default}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('default');
  });
});
