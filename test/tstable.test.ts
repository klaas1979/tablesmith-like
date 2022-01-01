import TSTable from '../src/module/tstable';

let tstable: TSTable;
describe('TSTable', () => {
  beforeEach(() => {
    tstable = new TSTable('tablename');
  });

  it('#addGroup with same name throws', () => {
    tstable.addGroup('groupName');
    expect(() => tstable.addGroup('groupName')).toThrow("Group name already defined got 'groupName'");
  });
});
describe('Tablesmith#groupForName', () => {
  beforeEach(() => {
    tstable = new TSTable('tablename');
  });

  it('returns group with name', () => {
    tstable.addGroup('name');
    expect(tstable.groupForName('name')?.name).toEqual('name');
  });
});
