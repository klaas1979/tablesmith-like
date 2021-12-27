import TSExpression from './tsexpression';

/**
 * Collection of expressions that make up the result of a TSRange or the Before and After parts within a Group.
 */
class TSExpressions {
  expressions: TSExpression[];
  constructor() {
    this.expressions = [];
  }

  /**
   * Gets text result for this expressions.
   * @returns string resulting text, for evaluating all expressions contained.
   */
  getText(): string {
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
}

export default TSExpressions;
