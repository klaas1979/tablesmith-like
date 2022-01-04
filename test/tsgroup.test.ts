import TSExpression from '../src/module/expressions/tsexpression';
import TSTextExpression from '../src/module/expressions/tstextexpression';
import TSGroup from '../src/module/tsgroup';
import TSRange from '../src/module/tsrange';

let group: TSGroup;
const name = 'groupname';
let roll: number;
let rangeExpression: TSExpression;
let range: TSRange;
describe('TSGroup (repeating)', () => {
  beforeEach(() => {
    group = new TSGroup(name, false, false);
    range = group.addRange(1);
    rangeExpression = new TSTextExpression('One');
    range.add(rangeExpression);
  });
  it('#result stores roll as LastRoll', () => {
    roll = 1;
    group.result(roll);
    expect(group.getLastRoll()).toBe(roll);
  });

  it('#result returns evaluated expression for roll', () => {
    roll = 1;
    const result = group.result(roll);
    expect(result).toBe('One');
  });

  it('#result with before add before prior to result', () => {
    roll = 1;
    group.getBefore().add(new TSTextExpression('Before'));
    const result = group.result(roll);
    expect(result).toBe('BeforeOne');
  });

  it('#result with after add after after result', () => {
    roll = 1;
    group.getAfter().add(new TSTextExpression('After'));
    const result = group.result(roll);
    expect(result).toBe('OneAfter');
  });

  it('#result with before and after adds both around result', () => {
    roll = 1;
    group.getBefore().add(new TSTextExpression('Before'));
    group.getAfter().add(new TSTextExpression('After'));
    const result = group.result(roll);
    expect(result).toBe('BeforeOneAfter');
  });
});

describe('TSGroup (non repeating)', () => {
  beforeEach(() => {
    group = new TSGroup(name, false, true);
    range = group.addRange(1);
    rangeExpression = new TSTextExpression('One');
    range.add(rangeExpression);
    range = group.addRange(2);
    rangeExpression = new TSTextExpression('Two');
    range.add(rangeExpression);
  });
  it('#result maxed out group', () => {
    roll = 1;
    const result = group.result(roll);
    expect(result).toBe('One');
    expect(result).toBe('<Non repeating Group maxed out!>');
  });
});
