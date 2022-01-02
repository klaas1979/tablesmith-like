import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Math min function to get smaller of the two values.
 */
class TSMathMinExpression implements TSExpression {
  param1: TSExpression;
  param2: TSExpression;
  constructor(param1: TSExpression, param2: TSExpression) {
    this.param1 = param1;
    this.param2 = param2;
  }
  evaluate(): string {
    const p1String = this.param1.evaluate();
    const value1 = Number.parseFloat(p1String);
    if (Number.isNaN(value1)) throw `Could not get Min for non number value '${p1String}'!`;
    const p2string = this.param2.evaluate();
    const value2 = Number.parseFloat(p2string);
    if (Number.isNaN(value2)) throw `Could not get Min for non number value '${p2string}'!`;
    return `${Math.min(value1, value2)}`;
  }
  getExpression(): string {
    return `{Min~${this.param1.getExpression()},${this.param2.getExpression()}}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSMathMinExpression;
