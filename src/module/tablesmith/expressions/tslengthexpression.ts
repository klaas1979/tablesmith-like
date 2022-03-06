import EvaluationContext from './evaluationcontext';
import { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
import TSExpressions from './tsexpressions';

/**
 * Returns length of text.
 */
export default class TSLengthExpression extends BaseTSExpression {
  textExpression: TSExpressions;
  constructor(textExpression: TSExpressions) {
    super();
    this.textExpression = textExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const text = (await this.textExpression.evaluate(evalcontext)).asString();
    return new SingleTSExpressionResult(text.length);
  }
  getExpression(): string {
    return `{Length~${this.textExpression.getExpression()}}`;
  }
}
