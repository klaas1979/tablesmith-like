import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Math Trunc function on contained expression, drops all decimal places.
 */
class TSMathTruncExpression implements TSExpression {
  param: TSExpression;
  constructor(param: TSExpression) {
    this.param = param;
  }
  evaluate(): TSExpressionResult {
    const valueString = this.param.evaluate().asString();
    const value = Number.parseInt(valueString);
    if (Number.isNaN(value)) throw `Could not get Trunc for non number value '${valueString}'!`;
    return new TSExpressionResult(value);
  }
  getExpression(): string {
    return `{Trunc~${this.param.getExpression()}}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSMathTruncExpression;
