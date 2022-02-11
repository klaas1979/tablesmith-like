import GroupCallSplitter from './callsplitter';
import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Class representing variable Get returning the value of the variable from table.
 * The variable can be referenced via ([tablename].)?[varname].
 */
export default class TSVariableGetExpression extends BaseTSExpression {
  tableGroupExpression: TSExpression;
  constructor(tableGroupExpression: TSExpression) {
    super();
    this.tableGroupExpression = tableGroupExpression;
  }

  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const evaluated = await this.tableGroupExpression.evaluate(evalcontext);
    const splitted = GroupCallSplitter.forVariable().split(evalcontext, evaluated.asString());
    return new SingleTSExpressionResult(`${evalcontext.getVar(splitted.tablename, splitted.variablename)}`);
  }

  getExpression(): string {
    return `%${this.tableGroupExpression.getExpression()}%`;
  }
}
