import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Math power function.
 */
export default class TSMathPowerExpression extends BaseTSExpression {
  param1: TSExpression;
  param2: TSExpression;
  constructor(param1: TSExpression, param2: TSExpression) {
    super();
    this.param1 = param1;
    this.param2 = param2;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const value1 = (await this.param1.evaluate(evalcontext)).asNumber();
    const value2 = (await this.param2.evaluate(evalcontext)).asNumber();
    return new SingleTSExpressionResult(Math.pow(value1, value2));
  }
  getExpression(): string {
    return `{Power~${this.param1.getExpression()}^${this.param2.getExpression()}}`;
  }
}
