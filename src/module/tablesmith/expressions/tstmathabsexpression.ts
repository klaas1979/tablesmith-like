import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Math Abs function on contaned expression.
 */
export default class TSMathAbsExpression extends BaseTSExpression {
  param: TSExpression;
  constructor(param: TSExpression) {
    super();
    this.param = param;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const value = (await this.param.evaluate(evalcontext)).asNumber();
    return new SingleTSExpressionResult(Math.abs(value));
  }
  getExpression(): string {
    return `{Abs~${this.param.getExpression()}}`;
  }
}
