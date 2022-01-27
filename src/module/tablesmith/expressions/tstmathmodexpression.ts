import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Math mod function to get remainder of division.
 */
class TSMathModExpression implements TSExpression {
  param1: TSExpression;
  param2: TSExpression;
  constructor(param1: TSExpression, param2: TSExpression) {
    this.param1 = param1;
    this.param2 = param2;
  }
  evaluate(): TSExpressionResult {
    const value1 = this.param1.evaluate().asNumber();
    const value2 = this.param2.evaluate().asNumber();
    return new TSExpressionResult(value1 % value2);
  }
  getExpression(): string {
    return `{Mod~${this.param1.getExpression()},${this.param2.getExpression()}}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSMathModExpression;
