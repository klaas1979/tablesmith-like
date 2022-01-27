import TSGroup from '../tsgroup';
import TSExpressionResult from './tsexpressionresult';

/**
 * Tablesmith expressions make up the values of a Range. If a Range is rolled the TSExpression
 * is evaluated to create the result.
 */
interface TSExpression {
  /**
   * Returns the result for this expression.
   */
  evaluate(): TSExpressionResult;

  /**
   * Returns the definition of the expression without evaluating it's result.
   */
  getExpression(): string;

  /**
   * Sets group the expression belongs to.
   * @param group this expression belongs to.
   */
  setGroup(group: TSGroup): void;
}

export default TSExpression;
