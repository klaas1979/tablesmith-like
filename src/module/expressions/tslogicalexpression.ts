import BooleanComparison from './booleancomparison';
import TSExpression from './tsexpression';
import TSGroup from '../tsgroup';

/**
 * TS Function for chaining boolean expressions "And" or "Or".
 */
class TSLogicalExpression implements TSExpression {
  functionName: string;
  comparisons: BooleanComparison[];
  constructor(functionName: string, comparisons: BooleanComparison[]) {
    this.functionName = functionName;
    this.comparisons = comparisons;
  }

  evaluate(): string {
    let result = '-1';
    const results: string[] = [];
    this.comparisons.forEach((comparison) => {
      results.push(comparison.evaluate());
    });
    if (results.includes('-1')) {
      result = '-1';
    } else if (this.functionName == 'Or') {
      result = results.includes('1') ? '1' : '0';
    } else if (this.functionName == 'And') {
      result = results.includes('0') ? '0' : '1';
    } else if (this.functionName == 'Xor') {
      const numTrueValue = results.reduce((sum, current) => sum + Number.parseInt(current), 0);
      result = numTrueValue == 1 ? '1' : '0';
    }
    return result;
  }

  getExpression(): string {
    const expressions = this.comparisons.reduce(
      (all, cur) => (all.length > 0 ? all + ',' + cur.getExpression() : cur.getExpression()),
      '',
    );
    return `{${this.functionName}~${expressions}}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSLogicalExpression;
