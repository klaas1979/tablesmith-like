import EvaluationContext from './expressions/evaluationcontext';
import TSExpression from './expressions/tsexpression';
import { TSExpressionResult } from './expressions/tsexpressionresult';
import TSExpressions from './expressions/tsexpressions';

class TSRange {
  lower: number;
  upper: number;
  lockedOut: boolean;
  expressions: TSExpressions;
  constructor(lower: number, upper: number) {
    this.lower = lower;
    this.upper = upper;
    this.lockedOut = false;
    this.expressions = new TSExpressions();
  }

  /**
   * Checks if given integer is in this Range.
   * @param value integer to check if it lies between or equal to upper and lower.
   * @returns boolean true if number is in range, false if not.
   */
  covers(value: number): boolean {
    return value >= this.lower && value <= this.upper;
  }

  /**
   * Integer defining the lower bound.
   * @returns number lower bound that belongs to this range.
   */
  getLower(): number {
    return this.lower;
  }

  /**
   * Integer defining the upper bound.
   * @returns number upper bound that belongs to this range.
   */
  getUpper(): number {
    return this.upper;
  }

  /**
   * Text result for this range.
   * @param evalcontext The EvaluationContext to use.
   * @returns strnig representing the evaluated expressions for this range.
   */
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    try {
      return await this.expressions.evaluate(evalcontext);
    } catch (error) {
      throw Error(`Error in Range '${this.lower}-${this.upper}'=>'${this.getExpression()}':\n${error}`);
    }
  }

  /**
   * Expressions making up this Range.
   * @returns string representation of contained expressions.
   */
  getExpression(): string {
    return this.expressions.getExpression();
  }

  /**
   * Adds given expression to ranges end.
   * @param expression to add to this range expressions end.
   */
  add(expression: TSExpression) {
    this.expressions.push(expression);
  }
  /**
   * Returns the underlying TSExpressions colleciton.
   * @returns TSExpressions collection for this Range.
   */
  getExpressions(): TSExpressions {
    return this.expressions;
  }

  /**
   * Returns if result is blocked or has been taken already.
   * @returns true if result has been taken or locked out in a  non repeating group.
   */
  isTaken(): boolean {
    return this.lockedOut;
  }

  /**
   * Locks out this result as already been taken.
   */
  lockout(): void {
    this.lockedOut = true;
  }

  /**
   * Unlocks result, to be available again.
   */
  unlock(): void {
    this.lockedOut = false;
  }
}

export default TSRange;
