import { BaseTSExpression } from './tsexpression';
import TSExpressionResult from './tsexpressionresult';
import TSExpressions from './tsexpressions';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
export default class TSBoldExpression extends BaseTSExpression {
  expressions: TSExpressions;
  constructor(expressions: TSExpressions) {
    super();
    this.expressions = expressions;
  }
  async evaluate(): Promise<TSExpressionResult> {
    const result = await this.expressions.evaluate();
    return new TSExpressionResult(`<b>${result.asString()}</b>`);
  }
  getExpression(): string {
    return `{Bold~${this.expressions.getExpression()}}`;
  }
}
