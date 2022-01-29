import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';
import { tstables } from '../../src/module/tablesmith/tstables';
import fs from 'fs';
import path from 'path';

describe('ToAD Villian Plan.tab', () => {
  let tablename: string;
  const filename = './test/tables/ToAD Villian Plan.tab';
  beforeAll(() => {
    tablesmith.reset();
    tablename = path.basename(filename, '.tab');
    tablesmith.addTable('ToAD', tablename, fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' }));
  });

  it('parsed complete', () => {
    expect(tstables.getTSTables().length).toBe(1);
    expect(tstables.getLastTSTable().getName()).toBe(tablename);
    expect(tablesmith.tableForName(tablename)?.getGroups().length).toEqual(50);
    const lastGroup = tstables.tableForName(tablename)?.getGroups()[50 - 1];
    expect(lastGroup?.getName()).toEqual('Reason_Why_in_Service');
  });

  it('[ToAD Villian Plan] generates a plan', () => {
    const result = tablesmith.evaluate('[ToAD Villian Plan]');
    console.log(result);
    expect(result.length).toBeGreaterThan(40);
  });
});

describe('ToAD Dungeon.tab', () => {
  let tablename: string;
  const filename = './test/tables/ToAD Dungeon.tab';
  beforeAll(() => {
    tablesmith.reset();
    tablename = path.basename(filename, '.tab');
    tablesmith.addTable('ToAD', tablename, fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' }));
  });

  it('parsed complete', () => {
    expect(tstables.getTSTables().length).toBe(1);
    expect(tstables.getLastTSTable().getName()).toBe(tablename);
    expect(tablesmith.tableForName(tablename)?.getGroups().length).toEqual(390);
    const lastGroup = tstables.tableForName(tablename)?.getGroups()[390 - 1];
    expect(lastGroup?.getName()).toEqual('Decoration');
  });

  it('[ToAD Dungeon] generates a dungeon', () => {
    const result = tablesmith.evaluate('[ToAD Dungeon]');
    console.log(result);
    expect(result.length).toBeGreaterThan(40);
  });
});
