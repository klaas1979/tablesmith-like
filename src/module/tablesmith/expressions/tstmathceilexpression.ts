import TSExpression, { BaseTSExpression } from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Math Ceil function on contaned expression.
 */
export default class TSMathCeilExpression extends BaseTSExpression {
  param: TSExpression;
  constructor(param: TSExpression) {
    super();
    this.param = param;
  }
  async evaluate(): Promise<TSExpressionResult> {
    const value = (await this.param.evaluate()).asNumber();
    return new TSExpressionResult(Math.ceil(value));
  }
  getExpression(): string {
    return `{Ceil~${this.param.getExpression()}}`;
  }
}
