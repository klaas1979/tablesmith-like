import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressions from './tsexpressions';

/**
 * Ternary if expression for TS-Function IIf ":" or If "/".
 */
class TSIfExpression implements TSExpression {
  functionName: string;
  ifExpression1: TSExpressions;
  operator: string;
  ifExpression2: TSExpressions;
  trueVal: TSExpressions;
  falseVal: TSExpressions;
  constructor(
    functionName: string,
    ifExpression1: TSExpressions,
    operator: string,
    ifExpression2: TSExpressions,
    trueVal: TSExpressions,
    falseVal: TSExpressions,
  ) {
    this.functionName = functionName;
    this.ifExpression1 = ifExpression1;
    this.operator = operator;
    this.ifExpression2 = ifExpression2;
    this.trueVal = trueVal;
    this.falseVal = falseVal;
  }
  evaluate(): string {
    let boolResult;
    const e1 = this.ifExpression1.getText(),
      e2 = this.ifExpression2.getText();
    switch (this.operator) {
      case '=':
        boolResult = e1 == e2;
        break;
      case '!=':
        boolResult = e1 != e2;
        break;
      case '<':
        boolResult = int(e1) < int(e2);
        break;
      case '>':
        boolResult = int(e1) > int(e2);
        break;
      case '<=':
        boolResult = int(e1) <= int(e2);
        break;
      case '>=':
        boolResult = int(e1) >= int(e2);
        break;
      default:
        throw `Operator '${this.operator}' for if expression unknown, cannot compare!`;
    }

    return boolResult ? this.trueVal.getText() : this.falseVal.getText();
  }

  getExpression(): string {
    const e1 = this.ifExpression1.getExpression(),
      e2 = this.ifExpression2.getExpression(),
      et = this.trueVal.getExpression(),
      ef = this.falseVal.getExpression();
    return `{${this.functionName}~${e1}${this.operator}${e2}?${et}${this.valueSeparator()}${ef}}`;
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

function int(val: string) {
  const int = Number.parseInt(val);
  if (Number.isNaN(int)) throw `Could not convert '${val}' to integer for If comparison!`;
  return int;
}

export default TSIfExpression;
