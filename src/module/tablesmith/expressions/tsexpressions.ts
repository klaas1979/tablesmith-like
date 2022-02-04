import TSExpression, { BaseTSExpression } from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Collection of expressions that make up the result of a TSRange or the Before and After parts within a Group.
 */
export default class TSExpressions extends BaseTSExpression {
  expressions: TSExpression[];
  constructor(expression: TSExpression | undefined = undefined) {
    super();
    this.expressions = [];
    if (expression) this.expressions.push(expression);
  }

  /**
   * Gets text result for this expressions.
   * @returns string resulting text, for evaluating all expressions contained.
   */
  async evaluate(): Promise<TSExpressionResult> {
    let result = '';
    for (const expression of this.expressions) {
      const subResult = await expression.evaluate();
      result += subResult.asString();
    }
    return new TSExpressionResult(result);
  }

  /**
   * Returns textual representation of the contained TSExpressions.
   * @returns string The combined representation of all contained expressions.
   */
  getExpression(): string {
    let result = '';
    for (const expression of this.expressions) {
      result += expression.getExpression();
    }
    return result;
  }
  /**
   * The number of expressions contained.
   * @returns number of expressions contained.
   */
  size(): number {
    return this.expressions.length;
  }

  /**
   * Adds given expression to end of collection.
   * @param expression to add to end of list.
   */
  push(expression: TSExpression) {
    this.expressions.push(expression);
  }

  /**
   * Unshifts given expression to beginning of collection.
   * @param expression to add to begining of list.
   */
  unshift(expression: TSExpression) {
    this.expressions.unshift(expression);
  }
}
