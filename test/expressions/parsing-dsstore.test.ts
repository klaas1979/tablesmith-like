import { DSStoreDatabase, DSStores } from '../../src/module/tablesmith/dsstore/dsstores';
import Tablesmith from '../../src/module/tablesmith/tablesmith';
let filename: string;
let simpleTable: string;
const tablesmith = new Tablesmith();
let data: Map<string, string>;
let dsStores: DSStores;
let db: DSStoreDatabase;
describe('Datastores', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
    data = new Map();
    db = {
      async datastores(): Promise<Map<string, string>> {
        return new Map();
      },
      async get(key: string): Promise<string | undefined> {
        return data.get(key);
      },
      async set(key: string, value: string): Promise<void> {
        data.set(key, value);
      },
    };
    dsStores = new DSStores(db);
    tablesmith.registerDSStores(dsStores);
  });
  it('{DSRead~ parses correctly', async () => {
    simpleTable = `:Start\n1,{DSRead~[groupForVar],[groupForStorename]}`;
    const table = tablesmith.addTable('folder', filename, simpleTable);
    expect(table.groupForName('Start')?.lastRange()?.getExpression()).toBe(
      '{DSRead~[groupForVar],[groupForStorename]}',
    );
  });

  it('{DSRead~reads from backend and does not change db', async () => {
    simpleTable = `%storevar%,\n:Start\n1,{DSRead~storevar,storename}`;
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.getErrorMessage()).toContain('Error: ');
    expect(await db.get('storename')).toBeUndefined();
  });
  describe('{DSCount~', () => {
    it('parses correctly', async () => {
      simpleTable = `:Start\n1,{DSCount~[groupForStoreVar]}`;
      const table = tablesmith.addTable('folder', filename, simpleTable);
      expect(table.groupForName('Start')?.lastRange()?.getExpression()).toBe('{DSCount~[groupForStoreVar]}');
    });
    it('error for non existing store', async () => {
      simpleTable = `%storevar%,\n:Start\n1,{DSCount~storevar}`;
      tablesmith.addTable('folder', filename, simpleTable);
      const result = await tablesmith.evaluate(`[${filename}]`);
      expect(result.getErrorMessage()).toContain('Error: ');
    });
    it('count for empty datastore', async () => {
      data.set('storename', JSON.stringify([{ name: 'default' }]));
      simpleTable = `%storevar%,\n:Start\n1,{DSRead~storevar,storename}{DSCount~storevar}`;
      tablesmith.addTable('folder', filename, simpleTable);
      const result = await tablesmith.evaluate(`[${filename}]`);
      expect(result.asString()).toBe('0');
    });
    it('count for non empty datastore', async () => {
      data.set('storename', JSON.stringify([{ name: 'default' }, { name: '2' }]));
      simpleTable = `%storevar%,\n:Start\n1,{DSRead~storevar,storename}{DSCount~storevar}`;
      tablesmith.addTable('folder', filename, simpleTable);
      const result = await tablesmith.evaluate(`[${filename}]`);
      expect(result.asString()).toBe('1');
    });
  });
});

describe('{DSCreate~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
    data = new Map();
    db = {
      async datastores(): Promise<Map<string, string>> {
        return new Map();
      },
      async get(key: string): Promise<string | undefined> {
        return data.get(key);
      },
      async set(key: string, value: string): Promise<void> {
        data.set(key, value);
      },
    };
    dsStores = new DSStores(db);
    tablesmith.registerDSStores(dsStores);
  });
  it('parses correctly', async () => {
    simpleTable = `%storevar%,\n:Start\n1,{DSCreate~storevar,v1,0,v2,1}`;
    const table = tablesmith.addTable('folder', filename, simpleTable);
    expect(table.groupForName('Start')?.lastRange()?.getExpression()).toBe('{DSCreate~storevar,v1,0,v2,1}');
  });
  it('error for missing default', async () => {
    simpleTable = `%storevar%,\n:Start\n1,{DSCreate~storevar,v1}`;
    expect(() => {
      tablesmith.addTable('folder', filename, simpleTable);
    }).toThrowError(/Error: .*/);
  });
  it('with ~v1, 0, v2, 2} creates in evalcontext', async () => {
    simpleTable = `%storevar%,\n:Start\n1,{DSCreate~storevar,v1, 0, v2, 1}`;
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('');
    expect(await db.get('storename')).toBeUndefined();
  });
});
describe('{DSAdd~', () => {
  beforeEach(() => {
    tablesmith.reset();
    filename = 'simpletable';
    data = new Map();
    db = {
      async datastores(): Promise<Map<string, string>> {
        return new Map();
      },
      async get(key: string): Promise<string | undefined> {
        return data.get(key);
      },
      async set(key: string, value: string): Promise<void> {
        data.set(key, value);
      },
    };
    dsStores = new DSStores(db);
    tablesmith.registerDSStores(dsStores);
  });
  describe('{DSAddNR~', () => {
    it('parses correctly', async () => {
      simpleTable = `%storevar%,\n:Start\n1,{DSAddNR~storevar,v1,0,v2,1}`;
      const table = tablesmith.addTable('folder', filename, simpleTable);
      expect(table.groupForName('Start')?.lastRange()?.getExpression()).toBe('{DSAddNR~storevar,v1,0,v2,1}');
    });
    it('with ~v1, 0, v2, 2} no index returned', async () => {
      simpleTable = `%storevar%,\n:Start\n1,{DSCreate~storevar,v1,0,v2,1}{DSAddNR~storevar,v1,10,v2,11}`;
      tablesmith.addTable('folder', filename, simpleTable);
      const result = await tablesmith.evaluate(`[${filename}]`);
      expect(result.asString()).toBe('');
    });
  });
  describe('{DSWrite~', () => {
    it('parses correctly', async () => {
      simpleTable = `%storevar%,\n:Start\n1,{DSWrite~storevar,storename}`;
      const table = tablesmith.addTable('folder', filename, simpleTable);
      expect(table.groupForName('Start')?.lastRange()?.getExpression()).toBe('{DSWrite~storevar,storename}');
    });
    it('write store writes all data', async () => {
      simpleTable = `%storevar%,\n:Start\n1,{DSCreate~storevar,v1,0,v2,1}{DSAddNR~storevar,v1,10,v2,11}{DSAddNR~storevar,v1,12,v2,13}{DSWrite~storevar,storename}`;
      tablesmith.addTable('folder', filename, simpleTable);
      const result = await tablesmith.evaluate(`[${filename}]`);
      expect(result.asString()).toBe('');
      expect(data.get('storename')).toEqual('[{"v1":"0","v2":"1"},{"v1":"10","v2":"11"},{"v1":"12","v2":"13"}]');
    });
  });
  describe('{DSGet~', () => {
    it('parses correctly', async () => {
      simpleTable = `%storevar%,\n:Start\n1,{DSGet~storevar,1,fieldname}`;
      const table = tablesmith.addTable('folder', filename, simpleTable);
      expect(table.groupForName('Start')?.lastRange()?.getExpression()).toBe('{DSGet~storevar,1,fieldname}');
    });
    it('invalid index 0', async () => {
      simpleTable = `%storevar%,\n:Start\n1,{DSCreate~storevar,v1,0,v2,1}{DSGet~storevar,0,v1}`;
      tablesmith.addTable('folder', filename, simpleTable);
      const result = await tablesmith.evaluate(`[${filename}]`);
      expect(result.getErrorMessage()).toContain('Error: ');
    });
    it('invalid index to high', async () => {
      simpleTable = `%storevar%,\n:Start\n1,{DSCreate~storevar,v1,0,v2,1}{DSAddNR~storevar,v1,10,v2,11}{DSGet~storevar,2,v1}`;
      tablesmith.addTable('folder', filename, simpleTable);
      const result = await tablesmith.evaluate(`[${filename}]`);
      expect(result.getErrorMessage()).toContain('Error: ');
    });
    it('non existing field', async () => {
      simpleTable = `%storevar%,\n:Start\n1,{DSCreate~storevar,v1,0,v2,1}{DSAddNR~storevar,v1,10,v2,11}{DSGet~storevar,1,v3}`;
      tablesmith.addTable('folder', filename, simpleTable);
      const result = await tablesmith.evaluate(`[${filename}]`);
      expect(result.getErrorMessage()).toContain('Error: ');
    });
    it('valid index and field', async () => {
      data.set('store', '[{"v1":"0","v2":"1"},{"v1":"10","v2":"11"},{"v1":"12","v2":"13"}]');
      simpleTable = `%storevar%,\n:Start\n1,{DSRead~storevar,store}e1_v1={DSGet~storevar,1,v1} e2_v2={DSGet~storevar,2,v2}`;
      tablesmith.addTable('folder', filename, simpleTable);
      const result = await tablesmith.evaluate(`[${filename}]`);
      expect(result.asString()).toBe('e1_v1=10 e2_v2=13');
    });
  });
  it('parses correctly', async () => {
    simpleTable = `%storevar%,\n:Start\n1,{DSAdd~storevar,v1,0,v2,1}`;
    const table = tablesmith.addTable('folder', filename, simpleTable);
    expect(table.groupForName('Start')?.lastRange()?.getExpression()).toBe('{DSAdd~storevar,v1,0,v2,1}');
  });
  it('error for missing value after key', async () => {
    simpleTable = `%storevar%,\n:Start\n1,{DSAdd~storevar,v1}`;
    expect(() => {
      tablesmith.addTable('folder', filename, simpleTable);
    }).toThrowError(/Error: .*/);
  });
  it('error adding to non defined/loaded DSStore', async () => {
    simpleTable = `%storevar%,\n:Start\n1,{DSAdd~storevar,v1, 0, v2, 1}`;
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.getErrorMessage()).toContain('Error: ');
    expect(await db.get('storename')).toBeUndefined();
  });
  it('with ~v1, 0, v2, 2} returns index added at', async () => {
    simpleTable = `%storevar%,\n:Start\n1,{DSCreate~storevar,v1,0,v2,1}{DSAdd~storevar,v1,10,v2,11}`;
    tablesmith.addTable('folder', filename, simpleTable);
    const result = await tablesmith.evaluate(`[${filename}]`);
    expect(result.asString()).toBe('1');
    expect(await db.get('storename')).toBeUndefined();
  });
});