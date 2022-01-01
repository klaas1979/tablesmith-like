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
    throw 'Not implemented';
  }
  getExpression(): string {
    throw 'Not implemented';
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSIfExpression;
