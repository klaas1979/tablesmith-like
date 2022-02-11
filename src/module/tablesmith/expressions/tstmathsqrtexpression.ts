import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Math Sqrt on given value.
 */
export default class TSMathSqrtExpression extends BaseTSExpression {
  param: TSExpression;
  constructor(param: TSExpression) {
    super();
    this.param = param;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const value = await this.param.evaluate(evalcontext);
    return new SingleTSExpressionResult(Math.sqrt(value.asNumber()));
  }
  getExpression(): string {
    return `{Sqrt~${this.param.getExpression()}}`;
  }
}
