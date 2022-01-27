import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Math Abs function on contaned expression.
 */
class TSMathAbsExpression implements TSExpression {
  param: TSExpression;
  constructor(param: TSExpression) {
    this.param = param;
  }
  evaluate(): TSExpressionResult {
    const value = this.param.evaluate().asNumber();
    return new TSExpressionResult(Math.abs(value));
  }
  getExpression(): string {
    return `{Abs~${this.param.getExpression()}}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSMathAbsExpression;
