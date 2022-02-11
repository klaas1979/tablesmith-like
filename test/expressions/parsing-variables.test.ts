import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';

let filename: string;
let simpleTable: string;

describe('Parsing variables', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('variable declaration without initial value creates empty variable', () => {
    simpleTable = '%varname%,\n:Start\n1,%varname%\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    expect(
      table.variables.find((v) => {
        return v.name === 'varname';
      })?.value,
    ).toBeNull();
  });

  it('variable declaration with initial value creates variable with value set', () => {
    simpleTable = '%varname%,value\n:Start\n1,%varname%\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    expect(
      table.variables.find((v) => {
        return v.name === 'varname';
      })?.value,
    ).toBe('value');
  });

  it('declared variable can be referenced with table and name from Group', async () => {
    simpleTable = `%varname%,value\n:Start\n1,%${filename}!varname%\n`;
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('value');
  });

  it('declared variable can be referenced from other table', async () => {
    tablesmith.addTable('folder', 'other', '%varname%,othervalue\n:Start\n1,other');
    simpleTable = `%varname%,value\n:Start\n1,%other!varname%\n`;
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('othervalue');
  });

  it('declared variable can be set from other table', async () => {
    tablesmith.addTable('folder', 'other', '%varname%,othervalue\n:Start\n1,other');
    simpleTable = `%varname%,value\n:Start\n1,|other!varname=%varname%|%other!varname%\n`;
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('value');
  });

  it('declared variable can be referenced from Group', async () => {
    simpleTable = `%varname%,value\n:Start\n1,%varname%\n`;
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('value');
  });
  it('declared variable can be chained', async () => {
    simpleTable = `%varname%,value\n:Start\n1,%varname%%varname%\n`;
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('valuevalue');
  });

  it('declared variable can be referenced from {Dice~', async () => {
    simpleTable = '%varname%,10\n:Start\n1,{Dice~1d1-%varname%}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('-9');
  });

  it('declared variable can be referenced from {Calc~', async () => {
    simpleTable = '%varname%,10\n:Start\n1,{Calc~1-%varname%}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('-9');
  });

  it('setting variables |varname=10|', async () => {
    simpleTable = '%varname%,\n:Start\n1,|varname=10|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe(10);
  });

  it('setting variables with Function |varname={Dice~10d1}|', async () => {
    simpleTable = '%varname%,\n:Start\n1,|varname={Dice~10d1}|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe(10);
  });

  it('setting variables with reference to same var |varname={Calc~%varname%+%varname%}|', async () => {
    simpleTable = '%varname%,99\n:Start\n1,|varname={Calc~%varname%+%varname%}|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe(198);
  });

  it('setting variables |varname+10|', async () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname+10|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe(20);
  });

  it('setting variables |varname-10|', async () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname-10|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe(0);
  });

  it('setting variables |varname*10|', async () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname*10|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe(100);
  });

  it('setting variables |varname/10|', async () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname/10|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe(1);
  });

  it('setting variables |varname/3| decimal value', async () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname/3|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBeCloseTo(3.33);
  });

  it('setting variables |varname\\3| var=10 rounding down', async () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname\\3|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe(3);
  });

  it('setting variables |varname\\3| var=11 rounding down', async () => {
    simpleTable = '%varname%,11\n:Start\n1,|varname\\3|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe(4);
  });

  it('setting variables |varname<3| var=1 changed', async () => {
    simpleTable = '%varname%,1\n:Start\n1,|varname<3|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe(3);
  });

  it('setting variables |varname<3| var unset changed', async () => {
    simpleTable = '%varname%,\n:Start\n1,|varname<3|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe(3);
  });

  it('setting variables |varname<3| var=4 unchanged', async () => {
    simpleTable = '%varname%,4\n:Start\n1,|varname<3|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe('4');
  });

  it('setting variables |varname>3| var=4 changed', async () => {
    simpleTable = '%varname%,4\n:Start\n1,|varname>3|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe(3);
  });

  it('setting variables |varname>3| var unset changed', async () => {
    simpleTable = '%varname%,\n:Start\n1,|varname>3|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe(3);
  });

  it('setting variables |varname>3| var=1 unchanged', async () => {
    simpleTable = '%varname%,1\n:Start\n1,|varname>3|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe('1');
  });

  it('setting variables |varname&3| var=1', async () => {
    simpleTable = '%varname%,1\n:Start\n1,|varname&3|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe('13');
  });
  it('setting variables |varname&3| var unset', async () => {
    simpleTable = '%varname%,\n:Start\n1,|varname&3|\n';
    const table = tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(result.getEvalcontext(0).getVar(table.name, 'varname')).toBe('3');
  });
});
