import BooleanComparison from './booleancomparison';
import TSExpression from './tsexpression';
import TSGroup from '../tsgroup';

/**
 * TS Function for chaining boolean expressions "And" or "Or".
 */
class TSLogicalExpression implements TSExpression {
  functionName: string;
  booleanComparison1: BooleanComparison;
  booleanComparison2: BooleanComparison;
  constructor(functionName: string, booleanComparison1: BooleanComparison, booleanComparison2: BooleanComparison) {
    this.functionName = functionName;
    this.booleanComparison1 = booleanComparison1;
    this.booleanComparison2 = booleanComparison2;
  }

  evaluate(): string {
    let result = '-1';
    const be1 = this.booleanComparison1.evaluate(),
      be2 = this.booleanComparison2.evaluate();
    if (be1 == '-1' || be2 == '-1') {
      result = '-1';
    } else if (this.functionName == 'Or') {
      result = be1 == '1' || be2 == '1' ? '1' : '0';
    } else if (this.functionName == 'And') {
      result = be1 == '1' && be2 == '1' ? '1' : '0';
    } else if (this.functionName == 'Xor') {
      result = (be1 == '1' && be2 == '0') || (be1 == '0' && be2 == '1') ? '1' : '0';
    }
    return result;
  }

  getExpression(): string {
    const e1 = this.booleanComparison1.getExpression(),
      e2 = this.booleanComparison2.getExpression();
    return `{${this.functionName}~${e1},${e2}}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSLogicalExpression;
