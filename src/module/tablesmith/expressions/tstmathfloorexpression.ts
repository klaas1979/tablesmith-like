import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Math Ceil function on contaned expression.
 */
export default class TSMathFloorExpression extends BaseTSExpression {
  param: TSExpression;
  constructor(param: TSExpression) {
    super();
    this.param = param;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const value = (await this.param.evaluate(evalcontext)).asNumber();
    return new SingleTSExpressionResult(Math.floor(value));
  }
  getExpression(): string {
    return `{Floor~${this.param.getExpression()}}`;
  }
}
