import TSGroup from '../tsgroup';
import TSExpressionResult from './tsexpressionresult';

/**
 * Tablesmith expressions make up the values of a Range. If a Range is rolled the TSExpression
 * is evaluated to create the result.
 */
export default interface TSExpression {
  /**
   * Returns the result for this expression.
   */
  evaluate(): Promise<TSExpressionResult>;

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

/**
 * Base implementation with default method implementations.
 */
export class BaseTSExpression implements TSExpression {
  async evaluate(): Promise<TSExpressionResult> {
    throw Error('Method not implemented.');
  }
  getExpression(): string {
    throw Error('Method not implemented.');
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}
