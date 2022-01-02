import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Math Trunc function on contained expression, drops all decimal places.
 */
class TSMathTruncExpression implements TSExpression {
  param: TSExpression;
  constructor(param: TSExpression) {
    this.param = param;
  }
  evaluate(): string {
    const valueString = this.param.evaluate();
    const value = Number.parseInt(valueString);
    if (Number.isNaN(value)) throw `Could not get Trunc for non number value '${valueString}'!`;
    return `${value}`;
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
