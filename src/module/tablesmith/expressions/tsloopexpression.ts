import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
import TSExpressions from './tsexpressions';

/**
 * Loop expression for iterating given number of times over a block.
 */
export default class TSLoopExpression extends BaseTSExpression {
  counterExpression: TSExpression;
  block: TSExpressions;
  constructor(counterExpression: TSExpression, block: TSExpressions) {
    super();
    this.counterExpression = counterExpression;
    this.block = block;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    let result = '';
    const maxValue = (await this.counterExpression.evaluate(evalcontext)).asInt();
    for (let i = 0; i < maxValue; i++) {
      result += (await this.block.evaluate(evalcontext)).asString();
    }
    return new SingleTSExpressionResult(result);
  }

  getExpression(): string {
    const counter = this.counterExpression.getExpression(),
      block = this.block.getExpression();
    return `{Loop~${counter},${block}}`;
  }
}
