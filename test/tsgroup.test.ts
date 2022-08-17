import EvaluationContext from '../src/module/tablesmith/expressions/evaluationcontext';
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
let evalcontext: EvaluationContext;
describe('TSGroup (repeating)', () => {
  beforeEach(() => {
    evalcontext = new EvaluationContext();
    group = new TSGroup(name, false, false);
    range = group.addRange(1);
    rangeExpression = new TSTextExpression('One');
    range.add(rangeExpression);
  });

  it('#isNonRepeating() -> false', () => {
    expect(group.isNonRepeating()).toBeFalsy();
  });

  it('#result stores roll as LastRoll', async () => {
    (await group.result(evalcontext, roll)).asString();
    expect(group.getLastRoll(evalcontext)).toBe(roll);
  });

  it('#result returns evaluated expression for roll', async () => {
    const result = (await group.result(evalcontext, roll)).asString();
    expect(result).toBe('One');
  });

  it('#result with before add before prior to result', async () => {
    group.getBefore().push(new TSTextExpression('Before'));
    const result = (await group.result(evalcontext, roll)).asString();
    expect(result).toBe('BeforeOne');
  });

  it('#result with after add after after result', async () => {
    group.getAfter().push(new TSTextExpression('After'));
    const result = (await group.result(evalcontext, roll)).asString();
    expect(result).toBe('OneAfter');
  });

  it('#result with before and after adds both around result', async () => {
    group.getBefore().push(new TSTextExpression('Before'));
    group.getAfter().push(new TSTextExpression('After'));
    const result = (await group.result(evalcontext, roll)).asString();
    expect(result).toBe('BeforeOneAfter');
  });

  it('#roll never maxes out', async () => {
    let result = await group.roll(evalcontext, modifier);
    expect(result.asString()).toBe('One');
    result = await group.roll(evalcontext, modifier);
    expect(result.asString()).toBe('One');
  });
});

describe('TSGroup (non repeating)', () => {
  beforeEach(() => {
    evalcontext = new EvaluationContext();
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

  it('#roll on maxed out group', async () => {
    let result = await group.roll(evalcontext, modifier);
    expect(['One', 'Two']).toContain(result.asString());
    result = await group.roll(evalcontext, modifier);
    expect(['One', 'Two']).toContain(result.asString());
    result = await group.roll(evalcontext, modifier);
    expect(result.asString()).toBe('{Non repeating Group maxed out!}');
  });

  it('#reset on maxed out group, restores entries', async () => {
    let result = await group.roll(evalcontext, modifier);
    await group.roll(evalcontext, modifier);
    await group.roll(evalcontext, modifier);
    result = await group.roll(evalcontext, modifier);
    expect(result.asString()).toBe('{Non repeating Group maxed out!}');
    group.reset();
    result = await group.roll(evalcontext, modifier);
    expect(['One', 'Two']).toContain(result.asString());
    result = await group.roll(evalcontext, modifier);
    expect(['One', 'Two']).toContain(result.asString());
  });
});
