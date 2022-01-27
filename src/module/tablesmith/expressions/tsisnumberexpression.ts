import TSExpression from './tsexpression';
import TSGroup from '../tsgroup';
import TSExpressionResult from './tsexpressionresult';

/**
 * TS Function for IsNumber check.
 */
class TSIsNumberExpression implements TSExpression {
  expression: TSExpression;
  constructor(expression: TSExpression) {
    this.expression = expression;
  }

  evaluate(): TSExpressionResult {
    const value = this.expression.evaluate().asString();
    const result = !Number.isNaN(Number.parseFloat(value)) || !Number.isNaN(Number.parseInt(value)) ? '1' : '0';
    return new TSExpressionResult(result);
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
