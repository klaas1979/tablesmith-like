import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Math max function to get bigger of the two values.
 */
export default class TSMathMaxExpression extends BaseTSExpression {
  values: TSExpression[];
  constructor(values: TSExpression[]) {
    super();
    this.values = values;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const nums = await Promise.all(this.values.map(async (value) => (await value.evaluate(evalcontext)).asNumber()));
    return new SingleTSExpressionResult(Math.max(...nums));
  }
  getExpression(): string {
    const expressions = this.values.reduce(
      (all, cur) => (all.length > 0 ? all + ',' + cur.getExpression() : cur.getExpression()),
      '',
    );
    return `{Max~${expressions}}`;
  }
}
