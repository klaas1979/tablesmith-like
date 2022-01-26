import { TSTable } from '../src/module/tablesmith/tstable';
import { tstables } from '../src/module/tablesmith/tstables';

const folderA = 'a';
let tableA: TSTable;
const folderB = 'b';
let tableB: TSTable;
describe('TSTables#addTable', () => {
  beforeEach(() => {
    tstables.reset();
    tableA = new TSTable(folderA, 'tableA');
    tableB = new TSTable(folderB, 'tableB');
  });

  it('each folder added to folders list', () => {
    tstables.addTable(tableA);
    tstables.addTable(tableB);
    expect(tstables.folders).toStrictEqual(['a', 'b']);
  });
  it('each folder added to folders list and ordered alphabetical', () => {
    tstables.addTable(tableB);
    tstables.addTable(tableA);
    expect(tstables.folders).toStrictEqual(['a', 'b']);
  });
  it('each folder added to folders only once', () => {
    tstables.addTable(tableB);
    tstables.addTable(new TSTable(folderB, 'otherTableB'));
    tstables.addTable(tableA);
    tstables.addTable(new TSTable(folderA, 'otherTableA'));
    expect(tstables.folders).toStrictEqual(['a', 'b']);
  });
});

describe('TSTables#tablesForFolder', () => {
  beforeEach(() => {
    tstables.reset();
    tableA = new TSTable(folderA, 'tableA');
    tableB = new TSTable(folderB, 'tableB');
    tstables.addTable(tableA);
    tstables.addTable(tableB);
  });

  it('returns only tables of folder', () => {
    expect(tstables.tablesForFolder(folderA)).toStrictEqual([tableA]);
    expect(tstables.tablesForFolder(folderB)).toStrictEqual([tableB]);
  });

  it('folder name with no tables', () => {
    expect(tstables.tablesForFolder('nonExisting')).toStrictEqual([]);
  });

  it('folder object works', () => {
    expect(tstables.tablesForFolder({ name: folderA })).toStrictEqual([tableA]);
  });
});
