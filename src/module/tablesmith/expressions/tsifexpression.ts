import TSGroup from '../tsgroup';
import BooleanComparison from './booleancomparison';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';
import TSExpressions from './tsexpressions';

/**
 * Ternary if expression for TS-Function IIf ":" or If "/".
 */
class TSIfExpression implements TSExpression {
  functionName: string;
  booleanComparision: BooleanComparison;
  trueVal: TSExpressions;
  falseVal: TSExpressions;
  constructor(
    functionName: string,
    booleanComparision: BooleanComparison,
    trueVal: TSExpressions,
    falseVal: TSExpressions,
  ) {
    this.functionName = functionName;
    this.booleanComparision = booleanComparision;
    this.trueVal = trueVal;
    this.falseVal = falseVal;
  }
  evaluate(): TSExpressionResult {
    const boolResult = this.booleanComparision.evaluate().asString();
    const result = boolResult == '1' ? this.trueVal.evaluate() : this.falseVal.evaluate();
    return new TSExpressionResult(result.asString());
  }

  getExpression(): string {
    const be = this.booleanComparision.getExpression(),
      et = this.trueVal.getExpression(),
      ef = this.falseVal.getExpression();
    return `{${this.functionName}~${be}?${et}${this.valueSeparator()}${ef}}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }

  /**
   * Correct true false value separator for function name.
   */
  private valueSeparator(): string {
    return this.functionName === 'If' ? '/' : ':';
  }
}

export default TSIfExpression;
