import {
  RerollableTSExpressionResult,
  TSExpressionResultCollection,
} from '../src/module/tablesmith/expressions/tsexpressionresult';
import { tablesmith } from '../src/module/tablesmith/tablesmithinstance';
import { tstables } from '../src/module/tablesmith/tstables';

let filename: string;
let simpleTable: string;

describe('Tablesmith#addTable', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
    simpleTable = ':name\n1,One\n2,Two\n';
  });

  it('single table filename set', () => {
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getTSTables().length).toBe(1);
    expect(tablesmith.tableForName(filename)?.name).toEqual(filename);
  });

  it('Group format with ";" range values are parsed as probability', () => {
    simpleTable = ';name\n1,One\n2,Two\n2,Three\n1,Four\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const ranges = tablesmith.tableForName(filename)?.getGroups()[0]?.getRanges();
    if (!ranges) throw Error('Not parsed!');
    expect(ranges[0]?.getLower()).toBe(1);
    expect(ranges[0]?.getUpper()).toBe(1);
    expect(ranges[1]?.getLower()).toBe(2);
    expect(ranges[1]?.getUpper()).toBe(3);
    expect(ranges[2]?.getLower()).toBe(4);
    expect(ranges[2]?.getUpper()).toBe(5);
    expect(ranges[3]?.getLower()).toBe(6);
    expect(ranges[3]?.getUpper()).toBe(6);
  });

  it('non repeating Group is set via "!"', () => {
    simpleTable = ':!name\n1,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.tableForName(filename)?.getGroups()[0]?.isNonRepeating()).toBe(true);
  });

  it('non repeating Group omitted not set', () => {
    simpleTable = ':name\n1,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tablesmith.tableForName(filename)?.getGroups()[0]?.isNonRepeating()).toBe(false);
  });
});

describe('Tablesmith#evaluate default values and modifiers', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
    simpleTable = ':Start\n1,One\n2,Two\n';
    tablesmith.addTable('folder', filename, simpleTable);
  });

  it('[tablename] defaults Group to "Start"', async () => {
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(['One', 'Two']).toContain(result.asString());
  });
});

describe('Tablesmith#evaluate with params', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('[tablename.Group(p1,p2)] order is valued', async () => {
    simpleTable = '%p2%,\n@p2,d,Prompt\n%p1%,\n@p1,d,Prompt\n:Start\n1,%p1%-%p2%';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = `[${filename}.Start(p1,p2)]`;
    const result = await tablesmith.evaluate(expression);
    expect(result.asString()).toBe('p2-p1');
  });
  it('[tablename.Group(,p2)] empty param is using default', async () => {
    simpleTable = '%p2%,default\n@p2,d,Prompt\n%p1%,default\n@p1,d,Prompt\n:Start\n1,%p1%-%p2%';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = `[${filename}.Start(,p2)]`;
    const result = await tablesmith.evaluate(expression);
    expect(result.asString()).toBe('p2-default');
  });

  it('to many params throws', async () => {
    simpleTable = '%p2%,\n@p2,d,Prompt\n%p1%,\n@p1,d,Prompt\n:Start\n1,%p1%-%p2%';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = `[${filename}.Start(p1,p2,x)]`;
    const result = await tablesmith.evaluate(expression);
    expect(result.getErrorMessage()).toContain('Error: ');
  });

  it('tmissing param throws', async () => {
    simpleTable = '%p2%,\n@p2,d,Prompt\n%p1%,\n@p1,d,Prompt\n:Start\n1,%p1%-%p2%';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = `[${filename}.Start(p1)]`;
    const result = await tablesmith.evaluate(expression);
    expect(result.getErrorMessage()).toContain('Error: ');
  });
});

describe('Tablesmith#evaluate with count of execution', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('[tablename.Group(p1,p2)]:2 rollCounts', async () => {
    simpleTable = '%p2%,\n@p2,d,Prompt\n%p1%,\n@p1,d,Prompt\n:Start\n1,%p1%-%p2%';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = `[${filename}.Start(p1,p2)]:2`;
    const result = await tablesmith.evaluate(expression);
    expect(result.asString()).toStrictEqual(['p2-p1', 'p2-p1']);
  });

  it('[tablename]:100 big roll counts', async () => {
    simpleTable = ':Start\n1,1';
    tablesmith.addTable('folder', filename, simpleTable);
    const expression = `[${filename}]:100`;
    const result = await tablesmith.evaluate(expression);
    const expected = [];
    for (let index = 0; index < 100; index++) expected.push('1');
    expect(result.asString()).toStrictEqual(expected);
  });
});

describe('Tablesmith#evaluate GroupCalls', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('call with modifier -10 returns min', async () => {
    simpleTable = ':Start\n1,[other-10]\n:other\n1,One\n2,Two';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('One');
  });

  it('call with modifier +10 returns max', async () => {
    simpleTable = ':Start\n1,[other+10]\n:other\n1,One\n2,Two';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('Two');
  });

  it('with = uses given result on table', async () => {
    simpleTable = ':Start\n1,[other=1]\n:other\n1,One\n2,Two';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('One');
  });

  it('call to other table with param', async () => {
    const otherTable = '%p2%,\n@p2,d,Prompt\n%p1%,\n@p1,d,Prompt\n:Start\n1,%p1%-%p2%';
    tablesmith.addTable('folder', 'other', otherTable);
    simpleTable = ':Start\n1,[other.Start(2,1)]';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('1-2');
  });

  it('call with parameter in modifier', async () => {
    simpleTable = `%var%,2\n:Start\n1,[other=%var%]\n:other\n1,one\n2,two`;
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('two');
  });
});

describe('Tablesmith#evaluate', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('for Group with before and after adds before and after to group result', async () => {
    simpleTable = ':Start\n<Before\n>After\n1,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('BeforeOneAfter');
  });
});

describe('Tablesmith#evaluate Expression', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('Calc={Calc~1d1+2},Dice={Dice~1d1+2} mixed text and functions evaluation', async () => {
    simpleTable = ':Start\n1,Calc={Calc~1d1+2},Dice={Dice~1d1+2}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('Calc=3,Dice=3');
  });
});

describe('Tablesmith#evaluate Calling Groups', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('Call [table.group]', async () => {
    simpleTable = `:Start\n1,[${filename}.other]\n\n:other\n1,Other`;
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('Other');
  });

  it('Call [group] in same table', async () => {
    simpleTable = `:Start\n1,[other]\n\n:other\n1,Other`;
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('Other');
  });

  it('Chained [group] calls in same table', async () => {
    simpleTable = `:first\n1,[second]\n\n:second\n1,[third]\n:third\n1,Third`;
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}.first]`);
    expect(result.asString()).toBe('Third');
  });
});

describe('Tablesmith#evaluate Groups with Re-roll Tag ~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });
  it('nested [~other] result collection', async () => {
    simpleTable = `:Start\n1,1[~other]2\n:other\n1,x`;
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).get(0);
    expect(result.isCollection()).toBeTruthy();
    expect((result as TSExpressionResultCollection).size()).toBe(3);
    expect((result as TSExpressionResultCollection).results[1].isRerollable).toBeTruthy();
    expect(result.asString()).toBe('1x2');
  });
  it('nested [~other] reroll does only change rerollable group', async () => {
    simpleTable = `:Start\n1,{Dice~5d999},[~other]\n:other\n1,{Dice~5d999}`;
    tablesmith.addTable('folder', filename, simpleTable);
    const result = (await tablesmith.evaluate(`[${filename}]`)).get(0);
    expect(result.isCollection()).toBeTruthy();
    const first = result.asString().split(',');
    const rerollable = (result as TSExpressionResultCollection).results[1] as RerollableTSExpressionResult;
    await rerollable.reroll();
    const second = result.asString().split(',');
    expect(first[0]).toBe(second[0]);
    expect(first[1]).not.toBe(second[1]);
  });
});
