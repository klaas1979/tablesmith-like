import { roller } from '../../src/module/expressions/rollerinstance';
import { tablesmith } from '../../src/module/tablesmithinstance';

let filename: string;
let simpleTable: string;

describe('Parsing {Dice~}', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('3d6+3 roll with modifier', () => {
    simpleTable = ':Start\n1,{Dice~3d6+3}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~3d6+3}');
  });

  it('1d4+3d6+4d8 chained rolls', () => {
    simpleTable = ':Start\n1,{Dice~1d4+3d6+4d8}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~1d4+3d6+4d8}');
  });

  it('1+2 addition', () => {
    simpleTable = ':Start\n1,{Dice~1+2}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~1+2}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('3');
  });

  it('2-1 subtraction', () => {
    simpleTable = ':Start\n1,{Dice~2-1}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~2-1}');
    expect(tablesmith.evaluate(`[${filename}.]`)).toBe('1');
  });

  it('3*6 multiplication', () => {
    simpleTable = ':Start\n1,{Dice~3*6}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~3*6}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('18');
  });

  it('18/6 division', () => {
    simpleTable = ':Start\n1,{Dice~18/6}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~18/6}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('3');
  });

  it('((5+5)/10)d(10-9) brackets', () => {
    simpleTable = ':Start\n1,{Dice~((5+5)/10)d(10-9)}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Dice~((5+5)/10)d(10-9)}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });
});

describe('Parsing {Calc~}', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('((5+5)/10) brackets', () => {
    simpleTable = ':Start\n1,{Calc~((5+5)/10)}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Calc~((5+5)/10)}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });

  it('((5+5)/10)d(10-9) brackets', () => {
    simpleTable = ':Start\n1,{Calc~((5+5)/10)d(10-9)}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(result).toBe('{Calc~((5+5)/10)d(10-9)}');
    expect(tablesmith.evaluate(`[${filename}]`)).toBe('1');
  });
});

describe('Parsing nested Math in Dice~ or Calc~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('{Dice~{Dice~3d1}d{Dice~1d1}}', () => {
    simpleTable = ':Start\n1,{Dice~{Dice~3d1}d{Dice~1d1}}\n';
    tablesmith.addTable(filename, simpleTable);
    const term = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getExpression();
    expect(term).toBe('{Dice~{Dice~3d1}d{Dice~1d1}}');
    const total = tablesmith.getLastTSTable()?.groupForName('Start')?.ranges[0]?.getText();
    expect(total).toBe('3');
  });
});

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
