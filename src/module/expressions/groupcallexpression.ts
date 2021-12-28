import { tablesmith } from '../tablesmithinstance';
import TSGroup from '../tsgroup';
import InnerDiceTerm from './innerdiceterm';
import GroupCallModifier from './groupcallmodifierterm';
import IntTerm from './intterm';
import { roller } from './rollerinstance';
import RollResult from './rollresult';
import TSExpression from './tsexpression';

/**
 * Expression to evaluate / roll on a tables group. If modifier is "=" set fixed result to true and add
 * Term defining the fixed result. If "+" or "-" are used as modifier add Term that describes the modifier
 * the modifer.
 */
class GroupCallExpression implements TSExpression {
  table: string | undefined;
  group: string;
  groupCallModifier: GroupCallModifier;
  constructor(table: string | undefined, group: string, groupCallModifier: GroupCallModifier | undefined) {
    this.table = table;
    this.group = group;
    this.groupCallModifier = groupCallModifier ? groupCallModifier : GroupCallModifier.createUnmodified();
  }

  evaluate(): string {
    const tsTable = this.table ? tablesmith.tableForName(this.table) : tablesmith.getEvaluateTable();
    if (!tsTable) throw `Table '${this.table}' is not defined cannot evaluate!`;
    const tsGroup = tsTable.groupForName(this.group);
    if (!tsGroup) throw `Group '${this.group}' is not defined cannot evaluate!`;
    const maxValue = tsGroup.getMaxValue();
    const innerDiceTerm = new InnerDiceTerm(new IntTerm(1), new IntTerm(maxValue));
    const termResult = this.groupCallModifier.modify(innerDiceTerm).roll(roller);

    return tsGroup.result(new RollResult(maxValue, termResult.total));
  }

  getExpression(): string {
    return `[${this.table}.${this.group}${this.groupCallModifier.getTerm()}]`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default GroupCallExpression;
