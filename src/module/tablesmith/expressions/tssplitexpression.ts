import EvaluationContext from './evaluationcontext';
import { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
import TSExpressions from './tsexpressions';

/**
 * Splitting variable value to many vars.
 */
export default class TSSplitExpression extends BaseTSExpression {
  splitVariableExpression: TSExpressions;
  separatorExpression: TSExpressions;
  vars: TSExpressions[];
  constructor(splitVariableExpression: TSExpressions, separatorExpression: TSExpressions, vars: TSExpressions[]) {
    super();
    this.splitVariableExpression = splitVariableExpression;
    this.separatorExpression = separatorExpression;
    this.vars = vars;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const variable = (await this.splitVariableExpression.evaluate(evalcontext)).asString();
    const separator = (await this.separatorExpression.evaluate(evalcontext)).asString();
    const variables = await Promise.all(
      this.vars.map(async (variable) => (await variable.evaluate(evalcontext)).asString()),
    );
    const tablename = evalcontext.getCurrentCallTablename();
    const value = `${evalcontext.getVar(tablename, variable)}`;
    const splitted = value.split(separator);
    splitted.forEach((v, i) => {
      evalcontext.assignVar(tablename, variables[i], v);
    });
    return new SingleTSExpressionResult('');
  }
  getExpression(): string {
    const variable = this.splitVariableExpression.getExpression();
    const separator = this.separatorExpression.getExpression();
    const expressions = this.vars.reduce(
      (all, cur) => (all.length > 0 ? all + ',' + cur.getExpression() : cur.getExpression()),
      '',
    );
    return `{Split~${variable},"${separator}",${expressions}}`;
  }
}
