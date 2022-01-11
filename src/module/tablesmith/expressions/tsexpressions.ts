import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Collection of expressions that make up the result of a TSRange or the Before and After parts within a Group.
 */
class TSExpressions implements TSExpression {
  expressions: TSExpression[];
  constructor() {
    this.expressions = [];
  }

  /**
   * Gets text result for this expressions.
   * @returns string resulting text, for evaluating all expressions contained.
   */
  evaluate(): string {
    let result = '';
    this.expressions.forEach((expression) => {
      result += expression.evaluate();
    });
    return result;
  }

  /**
   * Returns textual representation of the contained TSExpressions.
   * @returns string The combined representation of all contained expressions.
   */
  getExpression(): string {
    let result = '';
    this.expressions.forEach((expression) => {
      result += expression.getExpression();
    });
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
  add(expression: TSExpression) {
    this.expressions.push(expression);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSExpressions;
