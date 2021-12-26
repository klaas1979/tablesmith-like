import { roller } from '../src/module/expressions/rollerinstance';
import { tablesmith } from '../src/module/tablesmithinstance';

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
    expect(tablesmith.getTSTables().length).toBe(1);
    expect(tablesmith.tableForName(filename)?.name).toEqual(filename);
  });
});

describe('Tablesmith#evaluate default values and modifiers', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
    simpleTable = ':Start\n1,One\n2,Two\n';
    tablesmith.addTable(filename, simpleTable);
  });

  it('call without "=", "+" or "-" just rolls', () => {
    tablesmith.evaluate(`[${filename}.Start]`);
    const roll = roller.rolls?.pop()?.total;
    expect(roll).toBeGreaterThanOrEqual(1);
    expect(roll).toBeLessThanOrEqual(2);
  });

  it('[tablename] defaults Group to "Start"', () => {
    const result = tablesmith.evaluate(`[${filename}]`);
    expect(result.length).toBeGreaterThan(1);
  });

  it('call with modifier -10 returns min', () => {
    const result = tablesmith.evaluate(`[${filename}.Start-10]`);
    expect(result).toBe('One');
  });

  it('call with modifier +10 returns max', () => {
    const result = tablesmith.evaluate(`[${filename}.Start+10]`);
    expect(result).toBe('Two');
  });

  it('with = uses given result on table', () => {
    const result = tablesmith.evaluate(`[${filename}.Start=1]`);
    expect(result).toBe('One');
  });
});

describe('Tablesmith#evaluate Expression', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('Calc={Calc~1d1+2},Dice={Dice~1d1+2} mixed text and functions evaluation', () => {
    simpleTable = ':name\n1,Calc={Calc~1d1+2},Dice={Dice~1d1+2}\n';
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.evaluate(`[${filename}.name=1]`);
    expect(result).toBe('Calc=3,Dice=3');
  });
});

describe('Tablesmith#evaluate Calling Groups', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('Call [table.group]', () => {
    simpleTable = `:name\n1,[${filename}.other]\n\n:other\n1,Other`;
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.evaluate(`[${filename}.name]`);
    expect(result).toBe('Other');
  });

  it('Call [group] in same table', () => {
    simpleTable = `:name\n1,[other]\n\n:other\n1,Other`;
    tablesmith.addTable(filename, simpleTable);
    const result = tablesmith.evaluate(`[${filename}.name]`);
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
