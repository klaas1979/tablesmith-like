import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';

let filename: string;
let simpleTable: string;

describe('Parsing {InputList', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parsing correct', async () => {
    simpleTable = ':Start\n1,{InputList~2,Prompt,A,B,C,D,E}\n';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cb = async (defaultValue: number, prompt: string, options: string[]): Promise<number> => 3;
    tablesmith.registerInputListCallback(cb);
    const table = tablesmith.addTable('folder', filename, simpleTable);
    expect(table.groupForName('Start')?.lastRange()?.getExpression()).toBe('{InputList~2,Prompt,A,B,C,D,E}');
    expect((await tablesmith.evaluate(`[simpletable]`)).asString()).toEqual('3');
  });
  it('% can be added in prompt', async () => {
    simpleTable = ':Start\n1,{InputList~2,1/%,A,B}\n';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cb = async (defaultValue: number, prompt: string, options: string[]): Promise<number> => 1;
    tablesmith.registerInputListCallback(cb);
    const table = tablesmith.addTable('folder', filename, simpleTable);
    expect(table.groupForName('Start')?.lastRange()?.getExpression()).toBe('{InputList~2,1/%,A,B}');
    expect((await tablesmith.evaluate(`[simpletable]`)).asString()).toEqual('1');
  });
  it('error index below lower bounds', async () => {
    simpleTable = ':Start\n1,{InputList~0,Prompt,A,B}\n';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cb = async (defaultValue: number, prompt: string, options: string[]): Promise<number> => 3;
    tablesmith.registerInputListCallback(cb);
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).getErrorMessage()).toContain('Error in Group');
  });
  it('error index above upper bounds', async () => {
    simpleTable = ':Start\n1,{InputList~3,Prompt,A,B}\n';
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    const cb = async (defaultValue: number, prompt: string, options: string[]): Promise<number> => 3;
    tablesmith.registerInputListCallback(cb);
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).getErrorMessage()).toContain('Error in Group');
  });
});
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
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toEqual('Promptdefault');
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
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toEqual('');
    expect(msgCalled).toBe('sometext');
  });
});

describe('Parsing {Note~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('parsing correct', async () => {
    simpleTable = ':Start\n1,{Note~prompt}\n';
    const cb = async (prompt: string, defaultValue: string): Promise<string> => prompt + defaultValue;
    tablesmith.registerInputTextCallback(cb);
    const table = tablesmith.addTable('folder', filename, simpleTable);
    expect(table.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Note~prompt}');
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toEqual('prompt');
  });
});
