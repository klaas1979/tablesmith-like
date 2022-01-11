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
    tablesmith.addTable(filename, simpleTable);
    expect(tstables.getTSTables().length).toBe(1);
    expect(tablesmith.tableForName(filename)?.name).toEqual(filename);
  });

  it('Group format with ";" range values are parsed as probability', () => {
    simpleTable = ';name\n1,One\n2,Two\n2,Three\n1,Four\n';
    tablesmith.addTable(filename, simpleTable);
    const ranges = tablesmith.tableForName(filename)?.getGroups()[0]?.getRanges();
    if (!ranges) throw 'Not parsed!';
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
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.tableForName(filename)?.getGroups()[0]?.isNonRepeating()).toBe(true);
  });

  it('non repeating Group omitted not set', () => {
    simpleTable = ':name\n1,One\n';
    tablesmith.addTable(filename, simpleTable);
    expect(tablesmith.tableForName(filename)?.getGroups()[0]?.isNonRepeating()).toBe(false);
  });
});

describe('Tablesmith#evaluate default values and modifiers', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
    simpleTable = ':Start\n1,One\n2,Two\n';
    tablesmith.addTable(filename, simpleTable);
  });

  it('[tablename] defaults Group to "Start"', () => {
    const result = tablesmith.evaluate(`[${filename}]`);
    expect(result.length).toBeGreaterThan(1);
  });
});

describe('Tablesmith#evaluate Group calls', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('call with modifier -10 returns min', () => {
    simpleTable = ':Start\n1,[other-10]\n:other\n1,One\n2,Two';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.evaluate(`[${filename}]`);
    expect(result).toBe('One');
  });

  it('call with modifier +10 returns max', () => {
    simpleTable = ':Start\n1,[other+10]\n:other\n1,One\n2,Two';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.evaluate(`[${filename}]`);
    expect(result).toBe('Two');
  });

  it('with = uses given result on table', () => {
    simpleTable = ':Start\n1,[other=1]\n:other\n1,One\n2,Two';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.evaluate(`[${filename}]`);
    expect(result).toBe('One');
  });
});

describe('Tablesmith#evaluate', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('for Group with before and after adds before and after to group result', () => {
    simpleTable = ':Start\n<Before\n>After\n1,One\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.evaluate(`[${filename}]`);
    expect(result).toBe('BeforeOneAfter');
  });
});

describe('Tablesmith#evaluate Expression', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('Calc={Calc~1d1+2},Dice={Dice~1d1+2} mixed text and functions evaluation', () => {
    simpleTable = ':Start\n1,Calc={Calc~1d1+2},Dice={Dice~1d1+2}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.evaluate(`[${filename}]`);
    expect(result).toBe('Calc=3,Dice=3');
  });
});

describe('Tablesmith#evaluate Calling Groups', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('Call [table.group]', () => {
    simpleTable = `:Start\n1,[${filename}.other]\n\n:other\n1,Other`;
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.evaluate(`[${filename}]`);
    expect(result).toBe('Other');
  });

  it('Call [group] in same table', () => {
    simpleTable = `:Start\n1,[other]\n\n:other\n1,Other`;
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.evaluate(`[${filename}]`);
    expect(result).toBe('Other');
  });

  it('Chained [group] calls in same table', () => {
    simpleTable = `:first\n1,[second]\n\n:second\n1,[third]\n:third\n1,Third`;
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.evaluate(`[${filename}.first]`);
    expect(result).toBe('Third');
  });
});

// eslint:disable
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-nocheck
//import Roll from '@league-of-foundry-developers/foundry-vtt-types';
//import { MockProxy, mockDeep } from 'jest-mock-extended';
// eslint-disable-next-line jest/no-commented-out-tests
//it('#mockDeep Test', () => {
//  const rollMock: MockProxy<Roll> = mockDeep<Roll>();
//  rollMock.total.mockReturnValue(12);
//  expect(rollMock.total()).toEqual(12);
//});
