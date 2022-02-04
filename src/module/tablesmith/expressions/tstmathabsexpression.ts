import TSExpression, { BaseTSExpression } from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Math Abs function on contaned expression.
 */
export default class TSMathAbsExpression extends BaseTSExpression {
  param: TSExpression;
  constructor(param: TSExpression) {
    super();
    this.param = param;
  }
  async evaluate(): Promise<TSExpressionResult> {
    const value = (await this.param.evaluate()).asNumber();
    return new TSExpressionResult(Math.abs(value));
  }
  getExpression(): string {
    return `{Abs~${this.param.getExpression()}}`;
  }
}
