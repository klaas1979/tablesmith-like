import TSGroup from '../tsgroup';
import BooleanComparison from './booleancomparison';
import TSExpression from './tsexpression';
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
  evaluate(): string {
    const boolResult = this.booleanComparision.evaluate();
    return boolResult == '1' ? this.trueVal.getText() : this.falseVal.getText();
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
