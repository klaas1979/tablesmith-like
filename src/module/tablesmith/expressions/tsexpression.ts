import TSGroup from '../tsgroup';
import EvaluationContext from './evaluationcontext';
import { TSExpressionResult } from './tsexpressionresult';

/**
 * Tablesmith expressions make up the values of a Range. If a Range is rolled the TSExpression
 * is evaluated to create the result.
 */
export default interface TSExpression {
  /**
   * Returns if this is an expressions that is rerollable. Normally this is the case
   * for Groupcalls with the '~' sign at the beginning, and not for other Groupcalls without.
   * Potentially there may be other TSExpressions that are rerollable.
   * @returns true for rerollable Expressions, false otherwise.
   */
  isRerollable(): boolean;

  /**
   * Returns the result for this expression.
   * @param evalcontext the EvaluationContext used for creating the result.
   * @returns TSExpressionResult wrapped in Promise for async calling.
   */
  evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult>;

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
  isRerollable(): boolean {
    return false;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
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
