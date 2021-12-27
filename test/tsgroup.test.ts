import RollResult from '../src/module/expressions/rollresult';
import TSExpression from '../src/module/expressions/tsexpression';
import TSTextExpression from '../src/module/expressions/tstextexpression';
import TSGroup from '../src/module/tsgroup';
import TSRange from '../src/module/tsrange';

let group: TSGroup;
const name = 'groupname';
let roll: RollResult;
let rangeExpression: TSExpression;
let range: TSRange;
describe('TSGroup', () => {
  beforeEach(() => {
    group = new TSGroup(name);
    group.addRange(1);
    range = group.getRanges()[0];
    rangeExpression = new TSTextExpression('One');
    range.add(rangeExpression);
  });

  it('#result returns evaluated expression for roll', () => {
    roll = new RollResult(1, 1);
    const result = group.result(roll);
    expect(result).toBe('One');
  });

  it('#result with before add before prior to result', () => {
    roll = new RollResult(1, 1);
    group.getBefore().add(new TSTextExpression('Before'));
    const result = group.result(roll);
    expect(result).toBe('BeforeOne');
  });

  it('#result with after add after after result', () => {
    roll = new RollResult(1, 1);
    group.getAfter().add(new TSTextExpression('After'));
    const result = group.result(roll);
    expect(result).toBe('OneAfter');
  });

  it('#result with before and after adds both around result', () => {
    roll = new RollResult(1, 1);
    group.getBefore().add(new TSTextExpression('Before'));
    group.getAfter().add(new TSTextExpression('After'));
    const result = group.result(roll);
    expect(result).toBe('BeforeOneAfter');
  });
});
