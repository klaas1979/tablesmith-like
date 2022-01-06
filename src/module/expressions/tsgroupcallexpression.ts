import { tablesmith } from '../tablesmithinstance';
import TSGroup from '../tsgroup';
import { evalcontext } from './evaluationcontextinstance';
import GroupCallModifierTerm from './terms/groupcallmodifierterm';
import InnerDiceTerm from './terms/innerdiceterm';
import IntTerm from './terms/intterm';
import TSExpression from './tsexpression';

/**
 * Expression to evaluate / roll on a tables group. If modifier is "=" set fixed result to true and add
 * Term defining the fixed result. If "+" or "-" are used as modifier add Term that describes the modifier
 * the modifer.
 */
class TSGroupCallExpression implements TSExpression {
  table: string | undefined;
  group: string;
  groupCallModifier: GroupCallModifierTerm;
  constructor(table: string | undefined, group: string, groupCallModifier: GroupCallModifierTerm | undefined) {
    this.table = table;
    this.group = group;
    this.groupCallModifier = groupCallModifier ? groupCallModifier : GroupCallModifierTerm.createUnmodified();
  }

  evaluate(): string {
    const tsTable = tablesmith.tableForName(this.table ? this.table : evalcontext.getCurrentCallTablename());
    if (!tsTable) throw `Table '${this.table}' is not defined cannot evaluate!`;
    const tsGroup = tsTable.groupForName(this.group);
    if (!tsGroup) throw `Group '${this.group}' is not defined cannot evaluate!`;
    const maxValue = tsGroup.getMaxValue();
    const innerDiceTerm = new InnerDiceTerm(new IntTerm(1), new IntTerm(maxValue));
    const termResult = this.groupCallModifier.modify(innerDiceTerm).roll(evalcontext);

    evalcontext.pushCurrentCallTablename(tsTable.name);
    const result = tsGroup.result(termResult.total);
    evalcontext.popCurrentCallTablename();
    return result;
  }

  getExpression(): string {
    let tablePrefix = '';
    if (this.table != null) tablePrefix = `${this.table}.`;
    return `[${tablePrefix}${this.group}${this.groupCallModifier.getTerm()}]`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSGroupCallExpression;