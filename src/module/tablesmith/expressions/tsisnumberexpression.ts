import TSExpression from './tsexpression';
import TSGroup from '../tsgroup';

/**
 * TS Function for IsNumber check.
 */
class TSIsNumberExpression implements TSExpression {
  expression: TSExpression;
  constructor(expression: TSExpression) {
    this.expression = expression;
  }

  evaluate(): string {
    const value = this.expression.evaluate();
    return !Number.isNaN(Number.parseFloat(value)) || !Number.isNaN(Number.parseInt(value)) ? '1' : '0';
  }

  getExpression(): string {
    return `{IsNumber~${this.expression.getExpression()}}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSIsNumberExpression;
