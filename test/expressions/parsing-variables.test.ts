import { roller } from '../../src/module/expressions/rollerinstance';
import { tablesmith } from '../../src/module/tablesmithinstance';

let filename: string;
let simpleTable: string;

describe('Parsing variables', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('variable declaration without initial value creates empty variable', () => {
    simpleTable = '%varname%,\n:Start\n1,%varname%\n';
    tablesmith.addTable(filename, simpleTable);
    expect(roller.getVar(filename, 'varname')).toBeNull();
  });

  it('variable declaration with initial value creates variable with value set', () => {
    simpleTable = '%varname%,value\n:Start\n1,%varname%\n';
    tablesmith.addTable(filename, simpleTable);
    expect(roller.getVar(filename, 'varname')).toBe('value');
  });

  it('declared variable can be referenced from Group', () => {
    simpleTable = `%varname%,value\n:Start\n1,%${filename}.varname%\n`;
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('value');
  });

  it('declared variable can be referenced with table and name from Group', () => {
    simpleTable = `%varname%,value\n:Start\n1,%varname%\n`;
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('value');
  });

  it('declared variable can be referenced from {Dice~', () => {
    simpleTable = '%varname%,10\n:Start\n1,{Dice~1d1-%varname%}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('-9');
  });

  it('declared variable can be referenced from {Calc~', () => {
    simpleTable = '%varname%,10\n:Start\n1,{Calc~1-%varname%}\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('-9');
  });

  it('setting variables |varname=10|', () => {
    simpleTable = '%varname%,\n:Start\n1,|varname=10|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe(10);
  });

  it('setting variables with Function |varname={Dice~10d1}|', () => {
    simpleTable = '%varname%,\n:Start\n1,|varname={Dice~10d1}|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe(10);
  });

  it('setting variables with reference to same var |varname={Calc~%varname%+%varname%}|', () => {
    simpleTable = '%varname%,99\n:Start\n1,|varname={Calc~%varname%+%varname%}|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe(198);
  });

  it('setting variables |varname+10|', () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname+10|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe(20);
  });

  it('setting variables |varname-10|', () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname-10|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe(0);
  });

  it('setting variables |varname*10|', () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname*10|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe(100);
  });

  it('setting variables |varname/10|', () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname/10|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe(1);
  });

  it('setting variables |varname/3| decimal value', () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname/3|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBeCloseTo(3.33);
  });

  it('setting variables |varname\\3| var=10 rounding down', () => {
    simpleTable = '%varname%,10\n:Start\n1,|varname\\3|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe(3);
  });

  it('setting variables |varname\\3| var=11 rounding down', () => {
    simpleTable = '%varname%,11\n:Start\n1,|varname\\3|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe(4);
  });
  it('setting variables |varname<3| var=1 changed', () => {
    simpleTable = '%varname%,1\n:Start\n1,|varname<3|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe(3);
  });

  it('setting variables |varname<3| var unset changed', () => {
    simpleTable = '%varname%,\n:Start\n1,|varname<3|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe(3);
  });

  it('setting variables |varname<3| var=4 unchanged', () => {
    simpleTable = '%varname%,4\n:Start\n1,|varname<3|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe('4');
  });

  it('setting variables |varname>3| var=4 changed', () => {
    simpleTable = '%varname%,4\n:Start\n1,|varname>3|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe(3);
  });

  it('setting variables |varname>3| var unset changed', () => {
    simpleTable = '%varname%,\n:Start\n1,|varname>3|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe(3);
  });

  it('setting variables |varname>3| var=1 unchanged', () => {
    simpleTable = '%varname%,1\n:Start\n1,|varname>3|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe('1');
  });

  it('setting variables |varname&3| var=1', () => {
    simpleTable = '%varname%,1\n:Start\n1,|varname&3|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe('13');
  });
  it('setting variables |varname&3| var unset', () => {
    simpleTable = '%varname%,\n:Start\n1,|varname&3|\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('');
    expect(roller.getVar(filename, 'varname')).toBe('3');
  });
});
