import { tstables } from '../tstables';
import TSGroup from '../tsgroup';
import { evalcontext } from './evaluationcontextinstance';
import groupcallsplitter from './groupcallsplitter';
import GroupCallModifierTerm from './terms/groupcallmodifierterm';
import InnerDiceTerm from './terms/innerdiceterm';
import IntTerm from './terms/intterm';
import TSExpression from './tsexpression';
import TSExpressions from './tsexpressions';

/**
 * Expression to evaluate / roll on a tables group. If modifier is "=" set fixed result to true and add
 * Term defining the fixed result. If "+" or "-" are used as modifier add Term that describes the modifier
 * the modifer.
 */
class TSGroupCallExpression implements TSExpression {
  tableAndGroupExpression: TSExpression;
  groupCallModifier: GroupCallModifierTerm;
  params: TSExpressions[];
  constructor(
    tableAndGroupExpression: TSExpression,
    groupCallModifier: GroupCallModifierTerm | undefined,
    params: TSExpressions[],
  ) {
    this.tableAndGroupExpression = tableAndGroupExpression;
    this.groupCallModifier = groupCallModifier ? groupCallModifier : GroupCallModifierTerm.createUnmodified();
    this.params = params;
  }

  evaluate(): string {
    const tableAndGroup = this.tableAndGroupExpression.evaluate();
    const splitted = groupcallsplitter.split(tableAndGroup);
    const tsTable = tstables.tableForName(splitted.tablename);
    if (!tsTable) throw `Table '${splitted.tablename}' is not defined cannot evaluate!`;
    const tsGroup = tsTable.groupForName(splitted.variablename);
    if (!tsGroup) throw `Group '${splitted.variablename}' is not defined cannot evaluate!`;
    const maxValue = tsGroup.getMaxValue();
    const innerDiceTerm = new InnerDiceTerm(new IntTerm(1), new IntTerm(maxValue));
    const termResult = this.groupCallModifier.modify(innerDiceTerm).roll(evalcontext);

    let evaledParams: string[] = [];
    if (this.params && this.params.length > 0)
      evaledParams = this.params.map((exp) => {
        return exp.evaluate();
      });
    evalcontext.pushCurrentCallTablename(tsTable.name);
    tsTable.setParametersForEvaluationByIndex(evaledParams);
    const result = tsGroup.result(termResult.total);
    evalcontext.popCurrentCallTablename();
    return result;
  }

  getExpression(): string {
    let tablePrefix = '';
    const tableAndGroup = this.tableAndGroupExpression.evaluate();
    const splitted = groupcallsplitter.split(tableAndGroup);
    if (evalcontext.getCurrentCallTablename() != splitted.tablename) tablePrefix = `${splitted.tablename}.`;
    return `[${tablePrefix}${splitted.variablename}${this.groupCallModifier.getTerm()}]`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSGroupCallExpression;
