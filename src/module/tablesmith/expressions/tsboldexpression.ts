import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';
import TSExpressions from './tsexpressions';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
class TSBoldExpression implements TSExpression {
  expressions: TSExpressions;
  constructor(expressions: TSExpressions) {
    this.expressions = expressions;
  }
  evaluate(): TSExpressionResult {
    return new TSExpressionResult(`<b>${this.expressions.evaluate().asString()}</b>`);
  }
  getExpression(): string {
    return `{Bold~${this.expressions.getExpression()}}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSBoldExpression;
