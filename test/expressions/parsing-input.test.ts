import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';

let filename: string;
let simpleTable: string;

describe('Parsing {InputText', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parsing correct', async () => {
    simpleTable = ':Start\n1,{InputText~default,Prompt}\n';
    const cb = async (prompt: string, defaultValue: string): Promise<string> => prompt + defaultValue;
    tablesmith.registerInputTextCallback(cb);
    const table = tablesmith.addTable('folder', filename, simpleTable);
    expect(table.groupForName('Start')?.lastRange()?.getExpression()).toBe('{InputText~default,Prompt}');
    expect(await tablesmith.evaluate(`[simpletable]`)).toEqual('Promptdefault');
  });
});
