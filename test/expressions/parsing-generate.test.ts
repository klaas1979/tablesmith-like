import { RerollableTSExpressionResult } from '../../src/module/tablesmith/expressions/tsexpressionresult';
import Tablesmith from '../../src/module/tablesmith/tablesmith';
let filename: string;
let simpleTable: string;
const tablesmith = new Tablesmith();
describe('{Generate~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });
  it('only group: first call text, second GroupCall', async () => {
    simpleTable = `:Start\n1,{Generate~0,summary,~other}\n:other\n1,other`;
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('summary');
    const rerollable = result.get(0) as RerollableTSExpressionResult;
    expect(rerollable.results[0].isRerollable).toBeTruthy();
    await rerollable.reroll();
    expect(result.asString()).toBe('other');
  });
  it('table.group: first call text, second GroupCall', async () => {
    simpleTable = `:Start\n1,{Generate~0,summary,~simpletable.other}\n:other\n1,other`;
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('summary');
    const rerollable = result.get(0) as RerollableTSExpressionResult;
    expect(rerollable.results[0].isRerollable).toBeTruthy();
    await rerollable.reroll();
    expect(result.asString()).toBe('other');
  });
  it('table(parameter): first call text, second GroupCall', async () => {
    tablesmith.addTable('folder', 'called', '%var%,0\n@var,default,prompt\n:Start\n1,%var%');
    simpleTable = `:Start\n1,{Generate~0,summary,~called(other)}`;
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('summary');
    const rerollable = result.get(0) as RerollableTSExpressionResult;
    expect(rerollable.results[0].isRerollable).toBeTruthy();
    await rerollable.reroll();
    expect(result.asString()).toBe('other');
  });
  it('error for type != 0', async () => {
    simpleTable = `:Start\n1,{Generate~1,summary,~simpletable.other}\n:other\n1,other`;
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.getErrorMessage()).toContain('Error: ');
  });
});
