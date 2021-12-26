import { tablesmith } from '../../src/module/tablesmithinstance';
import fs from 'fs';
import path from 'path';

const filename = './test/tables/ToAD Villian Plan.tab';

describe('ToAD Villian Plan.tab', () => {
  let tablename: string;
  beforeAll(() => {
    tablename = path.basename(filename, '.tab');
    tablesmith.addTable(filename, fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' }));
  });

  it('parsed complete', () => {
    expect(tablesmith.getTSTables().length).toBe(1);
    expect(tablesmith.getLastTSTable().getName()).toBe(tablename);
    expect(tablesmith.tableForName(tablename)?.getGroups().length).toEqual(50);
    expect(tablesmith.tableForName(tablename)?.getCurrentGroup().getName()).toEqual('Reason_Why_in_Service');
  });

  it('[ToAD Villian Plan] generates a plan', () => {
    const result = tablesmith.evaluate('[ToAD Villian Plan]');
    console.log(result);
    expect(result.length).toBeGreaterThan(40);
  });
});
