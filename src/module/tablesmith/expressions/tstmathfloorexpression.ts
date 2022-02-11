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
  async evaluate(): Promise<TSExpressionResult> {
    const value = (await this.param.evaluate()).asNumber();
    return new SingleTSExpressionResult(Math.floor(value));
  }
  getExpression(): string {
    return `{Floor~${this.param.getExpression()}}`;
  }
}
