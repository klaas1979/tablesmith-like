import TSExpression from './expressions/tsexpression';
import TSExpressions from './expressions/tsexpressions';

class TSRange {
  lower: number;
  upper: number;
  expressions: TSExpressions;
  constructor(lower: number, upper: number) {
    this.lower = lower;
    this.upper = upper;
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
   * @returns strnig representing the evaluated expressions for this range.
   */
  evaluate(): string {
    return this.expressions.evaluate();
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
    this.expressions.add(expression);
  }
  /**
   * Returns the underlying TSExpressions colleciton.
   * @returns TSExpressions collection for this Range.
   */
  getExpressions(): TSExpressions {
    return this.expressions;
  }
}

export default TSRange;
