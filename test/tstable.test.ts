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

  it('#addBefore adds before to group, not counted as Range', () => {
    tstable.addGroup('groupName');
    tstable.addRange(1);
    tstable.addBefore();
    tstable.addExpression(new TSTextExpression('test'));
    expect(tstable.getCurrentGroup().getRanges().length).toBe(1);
  });

  it('#addBefore setups addExpression to add to it', () => {
    tstable.addGroup('groupName');
    tstable.addRange(1);
    tstable.addBefore();
    tstable.addExpression(new TSTextExpression('test'));
    expect(tstable.getCurrentGroup().getBefore().size()).toBe(1);
  });

  it('#addAfter adds after to group, not counted as Range', () => {
    tstable.addGroup('groupName');
    tstable.addRange(1);
    tstable.addAfter();
    tstable.addExpression(new TSTextExpression('test'));
    expect(tstable.getCurrentGroup().getRanges().length).toBe(1);
  });
  it('#addAfter setups addExpression to add to it', () => {
    tstable.addGroup('groupName');
    tstable.addRange(1);
    tstable.addAfter();
    tstable.addExpression(new TSTextExpression('test'));
    expect(tstable.getCurrentGroup().getAfter().size()).toBe(1);
  });

  it('#addExpressionToRange basic content line adds to ranges', () => {
    tstable.addGroup('groupName');
    tstable.addRange(1);
    const expression = new TSTextExpression('Text');
    tstable.addExpression(expression);
    const expected = new TSRange(1, 1);
    expected.add(expression);
    expect(tstable.getCurrentGroup().getRanges()).toEqual([expected]);
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
