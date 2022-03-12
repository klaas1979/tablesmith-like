import EvaluationContext from './evaluationcontext';
import { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
import TSExpressions from './tsexpressions';

/**
 * Left and Right Function.
 */
export default class TSMidExpression extends BaseTSExpression {
  lengthExpression: TSExpressions;
  startExpression: TSExpressions;
  textExpression: TSExpressions;
  constructor(lengthExpression: TSExpressions, startExpression: TSExpressions, textExpression: TSExpressions) {
    super();
    this.lengthExpression = lengthExpression;
    this.startExpression = startExpression;
    this.textExpression = textExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const length = (await this.lengthExpression.evaluate(evalcontext)).asInt();
    const start = (await this.startExpression.evaluate(evalcontext)).asInt();
    const text = (await this.textExpression.evaluate(evalcontext)).asString();
    if (length < 0 || length + start - 1 > text.length)
      throw Error(`Cannot get 'Mid' length '${length}' out of bounds 0-${text.length - start} for start '${start}'`);
    if (start < 1 || start > text.length)
      throw Error(`Cannot get 'Mid' start '${start}' out of bounds 1-${text.length}`);
    const result = text.slice(start - 1, start - 1 + length);
    return new SingleTSExpressionResult(result);
  }

  getExpression(): string {
    const start = this.startExpression.getExpression();
    const length = this.lengthExpression.getExpression();
    const text = this.textExpression.getExpression();
    return `{Mid~${length},${start},${text}}`;
  }
}
