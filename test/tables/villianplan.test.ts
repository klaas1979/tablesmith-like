import { tablesmith } from '../../src/module/tablesmithinstance';
import fs from 'fs';
import path from 'path';

const filename = './test/tables/ToAD Villian Plan.tab';

describe('ToAD Villian Plan.tab', () => {
  beforeAll(() => {
    tablesmith.addTable(filename, fs.readFileSync(filename, { encoding: 'utf8', flag: 'r' }));
  });

  it('parsed complete', () => {
    expect(tablesmith.getTSTables().length).toBe(1);
    expect(tablesmith.tableForName(filename)?.getGroups().length).toEqual(50);
    expect(tablesmith.tableForName(filename)?.getCurrentGroup().getName()).toEqual('Reason_Why_in_Service');
  });
});
