import TSTable from '../src/module/tstable';

let tstable: TSTable;
describe('TSTable', () => {
  beforeEach(() => {
    tstable = new TSTable('tablename');
  });

  it('#addGroup with same name throws', () => {
    tstable.addGroup('groupName', false, false);
    expect(() => tstable.addGroup('groupName', false, false)).toThrow("Group name already defined got 'groupName'");
  });
});
describe('Tablesmith#groupForName', () => {
  beforeEach(() => {
    tstable = new TSTable('tablename');
  });

  it('returns group with name', () => {
    tstable.addGroup('name', false, false);
    expect(tstable.groupForName('name')?.name).toEqual('name');
  });
});
