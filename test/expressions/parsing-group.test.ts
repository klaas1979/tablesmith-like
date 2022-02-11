/* eslint-disable jest/expect-expect */
import { tablesmith } from '../../src/module/tablesmith/tablesmithinstance';
import { tstables } from '../../src/module/tablesmith/tstables';

let filename: string;
let simpleTable: string;

describe('Parsing {LastRoll~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
    simpleTable = ':name\n1,One\n2,Two\n';
  });

  it('expression representation uses correct function name', () => {
    simpleTable = ':Start\n1,{LastRoll~}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{LastRoll~}');
  });

  it('returns roll result for the group it is called from', async () => {
    simpleTable = ':Start\n1,One{LastRoll~}[Other=2]\n:Other\n1,notused\n2,Two{LastRoll~}';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('One1Two2');
  });
});

describe('Parsing {MinVal~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });

  it('expression representation uses correct function name', () => {
    simpleTable = ':Start\n1,{MinVal~Start,1}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{MinVal~Start,1}');
  });

  it('min value from first range', async () => {
    simpleTable = ':Start\n1-49,{MinVal~Start,1}\n50-100,{MinVal~Start,1}';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('1');
  });

  it('min value from second range', async () => {
    simpleTable = ':Start\n1-49,{MinVal~Start,2}\n50-100,{MinVal~Start,2}';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('50');
  });
});
describe('Parsing {MaxVal~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });
  it('expression representation uses correct function name', () => {
    simpleTable = ':Start\n1,{MaxVal~Start,1}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{MaxVal~Start,1}');
  });
  it('max value from first range', async () => {
    simpleTable = ':Start\n1-49,{MaxVal~Start,1}\n50-100,{MaxVal~Start,1}';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('49');
  });
  it('max value from second range', async () => {
    simpleTable = ':Start\n1-49,{MaxVal~Start,2}\n50-100,{MaxVal~Start,2}';
    tablesmith.addTable('folder', filename, simpleTable);
    expect((await tablesmith.evaluate(`[${filename}]`)).asString()).toBe('100');
  });
});

describe('Parsing {Reset~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });
  it('expression representation uses correct function name', () => {
    simpleTable = ':Start\n1,{Reset~other}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const result = tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression();
    expect(result).toBe('{Reset~other}');
  });
  it('max value from first range', () => {
    simpleTable = ':Start\n1,{Lockout~other,1,2}{Reset~other}\n:!other\n1,One\n2,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const group = tstables.getLastTSTable().groupForName('other');
    const firstRange = group?.firstRange();
    const lastRange = group?.lastRange();
    return tablesmith.evaluate(`[${filename}]`).then(() => {
      expect(firstRange?.isTaken()).toBeFalsy();
      expect(lastRange?.isTaken()).toBeFalsy();
    });
  });
});

describe('Parsing {Lockout~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });
  it('expression representation uses correct function name', () => {
    simpleTable = ':Start\n1,{Lockout~other,1}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Lockout~other,1}');
  });
  it('{Lockout~other,1} simple value', () => {
    simpleTable = ':Start\n1,{Lockout~other,1}\n:!other\n1-5,One\n6-10,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const group = tstables.getLastTSTable().groupForName('other');
    const firstRange = group?.firstRange();
    const lastRange = group?.lastRange();
    return tablesmith.evaluate(`[${filename}]`).then(() => {
      expect(firstRange?.isTaken()).toBeTruthy();
      expect(lastRange?.isTaken()).toBeFalsy();
    });
  });
  it('{Lockout~other,1-5} simple range', () => {
    simpleTable = ':Start\n1,{Lockout~other,1-5}\n:!other\n1-5,One\n6-10,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const group = tstables.getLastTSTable().groupForName('other');
    const firstRange = group?.firstRange();
    const lastRange = group?.lastRange();
    return tablesmith.evaluate(`[${filename}]`).then(() => {
      expect(firstRange?.isTaken()).toBeTruthy();
      expect(lastRange?.isTaken()).toBeFalsy();
    });
  });
  it('{Lockout~other,1,2,3,4,5} list of values', () => {
    simpleTable = ':Start\n1,{Lockout~other,1,2,3,4,5}\n:!other\n1-5,One\n6-10,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const group = tstables.getLastTSTable().groupForName('other');
    const firstRange = group?.firstRange();
    const lastRange = group?.lastRange();
    return tablesmith.evaluate(`[${filename}]`).then(() => {
      expect(firstRange?.isTaken()).toBeTruthy();
      expect(lastRange?.isTaken()).toBeFalsy();
    });
  });
  it('{Lockout~other,1,2-4,5} list of values and ranges', () => {
    simpleTable = ':Start\n1,{Lockout~other,1,2-4,5}\n:!other\n1-5,One\n6-10,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const group = tstables.getLastTSTable().groupForName('other');
    const firstRange = group?.firstRange();
    const lastRange = group?.lastRange();
    tablesmith.evaluate(`[${filename}]`);
    return tablesmith.evaluate(`[${filename}]`).then(() => {
      expect(firstRange?.isTaken()).toBeTruthy();
      expect(lastRange?.isTaken()).toBeFalsy();
    });
  });
  it('{Lockout~other,5-6} range hits more than one Group.range', () => {
    simpleTable = ':Start\n1,{Lockout~other,5-6}\n:!other\n1-5,One\n6-10,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const group = tstables.getLastTSTable().groupForName('other');
    const firstRange = group?.firstRange();
    const lastRange = group?.lastRange();
    return tablesmith.evaluate(`[${filename}]`).then(() => {
      expect(firstRange?.isTaken()).toBeTruthy();
      expect(lastRange?.isTaken()).toBeTruthy();
    });
  });
  it('{Lockout~other,5-12} no error for out of bounds', () => {
    simpleTable = ':Start\n1,{Lockout~other,5-6}\n:!other\n1-5,One\n6-10,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const group = tstables.getLastTSTable().groupForName('other');
    const firstRange = group?.firstRange();
    const lastRange = group?.lastRange();
    return tablesmith.evaluate(`[${filename}]`).then(() => {
      expect(firstRange?.isTaken()).toBeTruthy();
      expect(lastRange?.isTaken()).toBeTruthy();
    });
  });
});

describe('Parsing {Unlock~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
  });
  it('expression representation uses correct function name', () => {
    simpleTable = ':Start\n1,{Unlock~other,1}\n';
    tablesmith.addTable('folder', filename, simpleTable);
    expect(tstables.getLastTSTable()?.groupForName('Start')?.lastRange()?.getExpression()).toBe('{Unlock~other,1}');
  });
  it('{Unlock~other,1} simple value', () => {
    simpleTable = ':Start\n1,{Lockout~other,1,6}{Unlock~other,1}\n:!other\n1-5,One\n6-10,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const group = tstables.getLastTSTable().groupForName('other');
    const firstRange = group?.firstRange();
    const lastRange = group?.lastRange();
    return tablesmith.evaluate(`[${filename}]`).then(() => {
      expect(firstRange?.isTaken()).toBeFalsy();
      expect(lastRange?.isTaken()).toBeTruthy();
    });
  });
  it('{Unlock~other,1-5} simple range', () => {
    simpleTable = ':Start\n1,{Lockout~other,1,6}{Unlock~other,1-5}\n:!other\n1-5,One\n6-10,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const group = tstables.getLastTSTable().groupForName('other');
    const firstRange = group?.firstRange();
    const lastRange = group?.lastRange();
    return tablesmith.evaluate(`[${filename}]`).then(() => {
      expect(firstRange?.isTaken()).toBeFalsy();
      expect(lastRange?.isTaken()).toBeTruthy();
    });
  });
  it('{Unlock~other,1,2,3,4,5} list of values', () => {
    simpleTable = ':Start\n1,{Lockout~other,1,6}{Unlock~other,1,2,3,4,5}\n:!other\n1-5,One\n6-10,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const group = tstables.getLastTSTable().groupForName('other');
    const firstRange = group?.firstRange();
    const lastRange = group?.lastRange();
    return tablesmith.evaluate(`[${filename}]`).then(() => {
      expect(firstRange?.isTaken()).toBeFalsy();
      expect(lastRange?.isTaken()).toBeTruthy();
    });
  });
  it('{Unlock~other,1,2-4,5} list of values and ranges', () => {
    simpleTable = ':Start\n1,{Lockout~other,1,6}{Unlock~other,1,2-4,5}\n:!other\n1-5,One\n6-10,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const group = tstables.getLastTSTable().groupForName('other');
    const firstRange = group?.firstRange();
    const lastRange = group?.lastRange();
    return tablesmith.evaluate(`[${filename}]`).then(() => {
      expect(firstRange?.isTaken()).toBeFalsy();
      expect(lastRange?.isTaken()).toBeTruthy();
    });
  });
  it('{Unlock~other,5-6} range hits more than one Group.range', () => {
    simpleTable = ':Start\n1,{Lockout~other,1,6}{Unlock~other,5-6}\n:!other\n1-5,One\n6-10,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const group = tstables.getLastTSTable().groupForName('other');
    const firstRange = group?.firstRange();
    const lastRange = group?.lastRange();
    return tablesmith.evaluate(`[${filename}]`).then(() => {
      expect(firstRange?.isTaken()).toBeFalsy();
      expect(lastRange?.isTaken()).toBeFalsy();
    });
  });
  it('{Unlock~other,5-12} no error for out of bounds', () => {
    simpleTable = ':Start\n1,{Lockout~other,1,6}{Unlock~other,5-6}\n:!other\n1-5,One\n6-10,One\n';
    tablesmith.addTable('folder', filename, simpleTable);
    const group = tstables.getLastTSTable().groupForName('other');
    const firstRange = group?.firstRange();
    const lastRange = group?.lastRange();
    return tablesmith.evaluate(`[${filename}]`).then(() => {
      expect(firstRange?.isTaken()).toBeFalsy();
      expect(lastRange?.isTaken()).toBeFalsy();
    });
  });
});
