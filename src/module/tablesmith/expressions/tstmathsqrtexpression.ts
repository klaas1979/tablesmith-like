import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Math Sqrt on given value.
 */
class TSMathSqrtExpression implements TSExpression {
  param: TSExpression;
  constructor(param: TSExpression) {
    this.param = param;
  }
  evaluate(): TSExpressionResult {
    const value = this.param.evaluate();
    return new TSExpressionResult(Math.sqrt(value.asNumber()));
  }
  getExpression(): string {
    return `{Sqrt~${this.param.getExpression()}}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSMathSqrtExpression;
