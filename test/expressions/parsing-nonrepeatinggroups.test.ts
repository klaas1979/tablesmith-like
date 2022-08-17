import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';

let filename: string;
let table: string;

describe('Non repeating groups', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });
  it('group call on non repeating', async () => {
    table = ':Start\n1,{Loop~4,[nonRep]}\n;!nonRep\n1,1\n1,2\n1,3\n';
    tablesmith.addTable('folder', filename, table);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toContain('1');
    expect(result).toContain('2');
    expect(result).toContain('3');
    expect(result).toContain('{Non repeating Group maxed out!}');
  });

  it('reset non repeating group same file', async () => {
    table = ':Start\n1,{Loop~3,[nonRep]}{Reset~nonRep}[nonRep]\n;!nonRep\n1,1\n1,2\n1,3\n';
    tablesmith.addTable('folder', filename, table);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toContain('1');
    expect(result).toContain('2');
    expect(result).toContain('3');
    expect(result).not.toContain('{Non repeating Group maxed out!}');
  });

  it('group call on non repeating other table', async () => {
    table = ':Start\n1,{Loop~4,[nr.nonRep]}\n';
    const nonRepTable = ':Start\n1,[nonRep]\n;!nonRep\n1,1\n1,2\n1,3\n';
    tablesmith.addTable('folder', 'nr', nonRepTable);
    tablesmith.addTable('folder', filename, table);
    const result = (await tablesmith.evaluate(`[${filename}]`)).asString();
    expect(result).toContain('1');
    expect(result).toContain('2');
    expect(result).toContain('3');
    expect(result).toContain('{Non repeating Group maxed out!}');
  });

  it('reset non repeating group other file', async () => {
    table = ':Start\n1,{Loop~3,[nr.nonRep]}{Reset~nr.nonRep}[nr.nonRep]\n';
    const nonRepTable = ':Start\n1,[nonRep]\n;!nonRep\n1,1\n1,2\n1,3\n';
    tablesmith.addTable('folder', 'nr', nonRepTable);
    tablesmith.addTable('folder', filename, table);
    const result = await tablesmith.evaluate(`[${filename}]`);
    const resString = result.asString();
    expect(resString).toContain('1');
    expect(resString).toContain('2');
    expect(resString).toContain('3');
    expect(resString).not.toContain('{Non repeating Group maxed out!}');
  });
});
