/**
 * Tablesmith expressions make up the values of a Range. If a Range is rolled the TSExpression
 * is evaluated to create the result.
 */
interface TSExpression {
  /**
   * Returns the result for this expression.
   */
  evaluate(): string;

  /**
   * Returns the definition of the expression without evaluating it's result.
   */
  getExpression(): string;
}

export default TSExpression;
