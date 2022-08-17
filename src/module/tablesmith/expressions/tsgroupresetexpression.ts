import { tstables } from '../tstables';
import CallSplitter from './callsplitter';
import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Resets a non repeating Group.
 */
export default class TSGroupResetExpression extends BaseTSExpression {
  tablename: string;
  tableAndGroupExpression: TSExpression;
  constructor(tablename: string, tableAndGroupExpression: TSExpression) {
    super();
    this.tablename = tablename;
    this.tableAndGroupExpression = tableAndGroupExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const tableAndGroup = await this.tableAndGroupExpression.evaluate(evalcontext);
    const splitted = CallSplitter.forGroup().split(evalcontext, tableAndGroup.asString());
    const tsTable = tstables.tableForName(splitted.tablename);
    if (!tsTable) throw Error(`Table '${splitted.tablename}' is not defined, cannot reset '${tableAndGroup}'`);
    const tsGroup = tsTable.groupForName(splitted.variablename);
    if (!tsGroup) throw Error(`Group '${splitted.variablename}' is not defined, cannot reset '${tableAndGroup}'`);
    tsGroup.reset();
    return new SingleTSExpressionResult('');
  }

  getExpression(): string {
    return `{Reset~${this.tableAndGroupExpression.getExpression()}}`;
  }
}
