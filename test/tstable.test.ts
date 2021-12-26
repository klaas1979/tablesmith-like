import TSTextExpression from '../src/module/expressions/tstextexpression';
import TSGroup from '../src/module/tsgroup';
import TSRange from '../src/module/tsrange';
import TSTable from '../src/module/tstable';

let tstable: TSTable;
describe('TSTable', () => {
  beforeEach(() => {
    tstable = new TSTable('tablename');
  });

  it('#addGroup creates new group', () => {
    tstable.addGroup('groupName');
    expect(tstable.getCurrentGroup()).toEqual(new TSGroup('groupName'));
  });

  it('#addGroup with same name throws', () => {
    tstable.addGroup('groupName');
    expect(() => tstable.addGroup('groupName')).toThrow("Group name already defined got 'groupName'");
  });

  it('#addRange with throws without prior added Range', () => {
    expect(() => tstable.addRange(2)).toThrow(`Group not initialized got upper='2'`);
  });

  it('#addRange basic content line adds to ranges', () => {
    tstable.addGroup('groupName');
    tstable.addRange(1);
    const expression = new TSTextExpression('Text');
    tstable.addExpressionToRange(expression);
    const expected = new TSRange(1, 1);
    expected.add(expression);
    expect(tstable.getCurrentGroup().getRanges()).toEqual([expected]);
  });

  it('#addRange calculates lower from previous range', () => {
    tstable.addGroup('groupName');
    tstable.addRange(1);
    tstable.addRange(10);
    expect(tstable.getCurrentGroup().getRanges()).toEqual([new TSRange(1, 1), new TSRange(2, 10)]);
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
