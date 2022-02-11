import BooleanComparison from './booleancomparison';
import EvaluationContext from './evaluationcontext';
import { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * TS Function for chaining boolean expressions "And" or "Or".
 */
export default class TSLogicalExpression extends BaseTSExpression {
  functionName: string;
  comparisons: BooleanComparison[];
  constructor(functionName: string, comparisons: BooleanComparison[]) {
    super();
    this.functionName = functionName;
    this.comparisons = comparisons;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    let result = '-1';
    const results: string[] = [];
    for (const comparison of this.comparisons) {
      results.push((await comparison.evaluate(evalcontext)).trim());
    }
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
    return new SingleTSExpressionResult(result);
  }

  getExpression(): string {
    const expressions = this.comparisons.reduce(
      (all, cur) => (all.length > 0 ? all + ',' + cur.getExpression() : cur.getExpression()),
      '',
    );
    return `{${this.functionName}~${expressions}}`;
  }
}
