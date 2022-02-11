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
  async evaluate(): Promise<TSExpressionResult> {
    const value = await this.param.evaluate();
    return new SingleTSExpressionResult(Math.sqrt(value.asNumber()));
  }
  getExpression(): string {
    return `{Sqrt~${this.param.getExpression()}}`;
  }
}
