import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Status Expression.
 */
export default class TSStatusExpression extends BaseTSExpression {
  statusExpression: TSExpression;

  constructor(statusExpression: TSExpression) {
    super();
    this.statusExpression = statusExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const text = (await this.statusExpression.evaluate(evalcontext)).asString();
    await evalcontext.setStatus(text);
    return new SingleTSExpressionResult('');
  }

  getExpression(): string {
    return `{Status~${this.statusExpression.getExpression()}}`;
  }
}
