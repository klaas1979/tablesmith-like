import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Math Sqrt on given value.
 */
class TSMathSqrtExpression implements TSExpression {
  param: TSExpression;
  constructor(param: TSExpression) {
    this.param = param;
  }
  evaluate(): string {
    const valueString = this.param.evaluate();
    const value = Number.parseFloat(valueString);
    if (Number.isNaN(value)) throw `Could not get Trunc for non number value '${valueString}'!`;
    return `${Math.sqrt(value)}`;
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
