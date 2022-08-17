import { tstables } from '../tstables';
import CallSplitter from './callsplitter';
import GroupCallModifierTerm from './terms/groupcallmodifierterm';
import TSExpression, { BaseTSExpression } from './tsexpression';
import TSExpressions from './tsexpressions';
import { TSExpressionResult, RerollableTSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';

/**
 * Expression to evaluate / roll on a tables group. If modifier is "=" set fixed result to true and add
 * Term defining the fixed result. If "+" or "-" are used as modifier add Term that describes the modifier
 * the modifer.
 */
export default class TSGroupCallExpression extends BaseTSExpression {
  private tableAndGroupExpression: TSExpression;
  private rerollable: boolean;
  private groupCallModifier: GroupCallModifierTerm;
  private params: TSExpressions[];
  constructor(
    rerollable: boolean,
    tableAndGroupExpression: TSExpression,
    groupCallModifier: GroupCallModifierTerm | undefined,
    params: TSExpressions[],
  ) {
    super();
    this.rerollable = rerollable;
    this.tableAndGroupExpression = tableAndGroupExpression;
    this.groupCallModifier = groupCallModifier ? groupCallModifier : GroupCallModifierTerm.createUnmodified();
    this.params = params;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const tableAndGroup = await this.tableAndGroupExpression.evaluate(evalcontext);
    const splitted = CallSplitter.forGroup().split(evalcontext, tableAndGroup.asString());
    const tsTable = tstables.tableForName(splitted.tablename);
    if (!tsTable) throw Error(`Table '${splitted.tablename}' is not defined cannot evaluate!`);
    const tsGroup = tsTable.groupForName(splitted.variablename);
    if (!tsGroup) throw Error(`Group '${splitted.variablename}' is not defined cannot evaluate!`);

    let evaledParams: string[] = [];
    if (this.params && this.params.length > 0)
      evaledParams = await Promise.all(
        this.params.map(async (p) => {
          return (await p.evaluate(evalcontext)).asString();
        }),
      );
    evalcontext.pushCurrentCallTablename(tsTable.name);
    tsTable.setParametersForEvaluationByIndex(evalcontext, evaledParams);
    const result = await tsGroup.roll(evalcontext, this.groupCallModifier);
    evalcontext.popCurrentCallTablename();
    return new RerollableTSExpressionResult(evalcontext, result, this.rerollable ? this : undefined);
  }

  getExpression(): string {
    const tableAndGroup = this.tableAndGroupExpression.getExpression();
    const rerollTag = this.rerollable ? '~' : '';
    return `[${rerollTag}${tableAndGroup}${this.groupCallModifier.getExpression()}]`;
  }
}
