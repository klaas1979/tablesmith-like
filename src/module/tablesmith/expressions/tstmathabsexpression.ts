import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Math Abs function on contaned expression.
 */
class TSMathAbsExpression implements TSExpression {
  param: TSExpression;
  constructor(param: TSExpression) {
    this.param = param;
  }
  evaluate(): string {
    const valueString = this.param.evaluate();
    const value = Number.parseFloat(valueString);
    if (Number.isNaN(value)) throw `Could not get Abs for non number value '${valueString}'!`;
    return `${Math.abs(value)}`;
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
