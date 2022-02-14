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
    expect((await tablesmith.evaluate(`[simpletable]`)).asString()).toEqual('Promptdefault');
  });
});

describe('Parsing {Msg', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parsing correct', async () => {
    simpleTable = ':Start\n1,{Msg~sometext}\n';
    let msgCalled = '';
    const cb = async (prompt: string): Promise<void> => {
      msgCalled = prompt;
    };
    tablesmith.registerMsgCallback(cb);
    const table = tablesmith.addTable('folder', filename, simpleTable);
    expect(table.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Msg~sometext}');
    expect((await tablesmith.evaluate(`[simpletable]`)).asString()).toEqual('');
    expect(msgCalled).toBe('sometext');
  });
});
