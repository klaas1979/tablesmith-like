import GroupCallModifierTerm from '../src/module/tablesmith/expressions/terms/groupcallmodifierterm';
import TSExpression from '../src/module/tablesmith/expressions/tsexpression';
import TSTextExpression from '../src/module/tablesmith/expressions/tstextexpression';
import TSGroup from '../src/module/tablesmith/tsgroup';
import TSRange from '../src/module/tablesmith/tsrange';

let group: TSGroup;
const name = 'groupname';
const modifier = GroupCallModifierTerm.createUnmodified();
const roll = 1;
let rangeExpression: TSExpression;
let range: TSRange;
describe('TSGroup (repeating)', () => {
  beforeEach(() => {
    group = new TSGroup(name, false, false);
    range = group.addRange(1);
    rangeExpression = new TSTextExpression('One');
    range.add(rangeExpression);
  });

  it('#isNonRepeating() -> false', () => {
    expect(group.isNonRepeating()).toBeFalsy();
  });

  it('#result stores roll as LastRoll', () => {
    group.result(roll);
    expect(group.getLastRoll()).toBe(roll);
  });

  it('#result returns evaluated expression for roll', () => {
    const result = group.result(roll);
    expect(result).toBe('One');
  });

  it('#result with before add before prior to result', () => {
    group.getBefore().add(new TSTextExpression('Before'));
    const result = group.result(roll);
    expect(result).toBe('BeforeOne');
  });

  it('#result with after add after after result', () => {
    group.getAfter().add(new TSTextExpression('After'));
    const result = group.result(roll);
    expect(result).toBe('OneAfter');
  });

  it('#result with before and after adds both around result', () => {
    group.getBefore().add(new TSTextExpression('Before'));
    group.getAfter().add(new TSTextExpression('After'));
    const result = group.result(roll);
    expect(result).toBe('BeforeOneAfter');
  });

  it('#roll never maxes out', () => {
    let result = group.roll(modifier);
    expect(result).toBe('One');
    result = group.roll(modifier);
    expect(result).toBe('One');
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
  it('#isNonRepeating() -> true', () => {
    expect(group.isNonRepeating()).toBeTruthy();
  });

  it('#roll on maxed out group', () => {
    let result = group.roll(modifier);
    expect(['One', 'Two']).toContain(result);
    result = group.roll(modifier);
    expect(['One', 'Two']).toContain(result);
    result = group.roll(modifier);
    expect(result).toBe('<Non repeating Group maxed out!>');
  });

  it('#reset on maxed out group, restores entries', () => {
    let result = group.roll(modifier);
    group.roll(modifier);
    group.roll(modifier);
    result = group.roll(modifier);
    expect(result).toBe('<Non repeating Group maxed out!>');
    group.reset();
    result = group.roll(modifier);
    expect(['One', 'Two']).toContain(result);
    result = group.roll(modifier);
    expect(['One', 'Two']).toContain(result);
  });
});
