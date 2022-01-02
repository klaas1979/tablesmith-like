import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Math Ceil function on contaned expression.
 */
class TSMathCeilExpression implements TSExpression {
  param: TSExpression;
  constructor(param: TSExpression) {
    this.param = param;
  }
  evaluate(): string {
    const valueString = this.param.evaluate();
    const value = Number.parseFloat(valueString);
    if (Number.isNaN(value)) throw `Could not get Ceil for non number value '${valueString}'!`;
    return `${Math.ceil(value)}`;
  }
  getExpression(): string {
    return `{Ceil~${this.param.getExpression()}}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSMathCeilExpression;
