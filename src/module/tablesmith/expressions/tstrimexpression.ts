import EvaluationContext from './evaluationcontext';
import { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
import TSExpressions from './tsexpressions';

/**
 * Trims whitespace of text.
 */
export default class TSTrimExpression extends BaseTSExpression {
  textExpression: TSExpressions;
  constructor(textExpression: TSExpressions) {
    super();
    this.textExpression = textExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const text = (await this.textExpression.evaluate(evalcontext)).asString();
    return new SingleTSExpressionResult(text.trim());
  }
  getExpression(): string {
    return `{Trim~${this.textExpression.getExpression()}}`;
  }
}
