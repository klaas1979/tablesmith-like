import EvaluationContext from '../src/module/tablesmith/expressions/evaluationcontext';
import { TSTable } from '../src/module/tablesmith/tstable';

let tstable: TSTable;
let evalcontext: EvaluationContext;
describe('TSTable', () => {
  beforeEach(() => {
    tstable = new TSTable('folder', 'tablename');
    evalcontext = new EvaluationContext();
  });

  it('#addGroup with same name throws', () => {
    tstable.addGroup('groupName', false, false);
    expect(() => tstable.addGroup('groupName', false, false)).toThrow("Group name already defined got 'groupName'");
  });
});
describe('TSTable#groupForName', () => {
  beforeEach(() => {
    tstable = new TSTable('folder', 'tablename');
  });

  it('returns group with name', () => {
    tstable.addGroup('name', false, false);
    expect(tstable.groupForName('name')?.name).toEqual('name');
  });
});

describe('TSTable#resetEvaluationContext', () => {
  beforeEach(() => {
    tstable = new TSTable('folder', 'tablename');
    tstable.declareVariable('name', '1');
    const tsgroup = tstable.addGroup('Start', false, true);
    const tsrange = tsgroup.addRange(1);
    tsrange.lockout();
  });

  it('resets variable declaration', () => {
    evalcontext.assignVar('tablename', 'name', '2');
    tstable.prepareEvaluationContext(evalcontext);
    expect(evalcontext.getVar('tablename', 'name')).toBe('1');
  });

  it('unlocks all lockout ranges in groups', () => {
    tstable.prepareEvaluationContext(evalcontext);
    expect(tstable.getGroups()[0]?.firstRange()?.isTaken()).toBeFalsy();
  });
});
