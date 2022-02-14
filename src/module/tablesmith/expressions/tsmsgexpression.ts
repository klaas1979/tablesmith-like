import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Expression that prompts a message to user.
 */
export default class TSMsgExpression extends BaseTSExpression {
  prompt: TSExpression;

  constructor(prompt: TSExpression) {
    super();
    this.prompt = prompt;
  }

  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const prompt = (await this.prompt.evaluate(evalcontext)).asString().trim();
    await evalcontext.promptMsg(prompt);
    return new SingleTSExpressionResult('');
  }

  getExpression(): string {
    return `{Msg~${this.prompt.getExpression()}}`;
  }
}
