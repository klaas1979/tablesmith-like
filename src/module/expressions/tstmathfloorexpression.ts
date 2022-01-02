import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Math Ceil function on contaned expression.
 */
class TSMathFloorExpression implements TSExpression {
  param: TSExpression;
  constructor(param: TSExpression) {
    this.param = param;
  }
  evaluate(): string {
    const valueString = this.param.evaluate();
    const value = Number.parseFloat(valueString);
    if (Number.isNaN(value)) throw `Could not get Floor for non number value '${valueString}'!`;
    return `${Math.floor(value)}`;
  }
  getExpression(): string {
    return `{Floor~${this.param.getExpression()}}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSMathFloorExpression;
