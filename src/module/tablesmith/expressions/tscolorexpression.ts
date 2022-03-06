import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Simple Color Expression that colors an output part.
 */
export default class TSColorExpression extends BaseTSExpression {
  colorExpression: TSExpression;
  textExpression: TSExpression;

  constructor(colorExpression: TSExpression, textExpression: TSExpression) {
    super();
    this.colorExpression = colorExpression;
    this.textExpression = textExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const color = (await this.colorExpression.evaluate(evalcontext)).asString();
    const text = (await this.textExpression.evaluate(evalcontext)).asString();
    return new SingleTSExpressionResult(`<span style="color: ${color}">${text}</span>`);
  }

  getExpression(): string {
    return `{Color~${this.colorExpression.getExpression()},${this.textExpression.getExpression()}}`;
  }
}
