import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
/**
 * Expression that asks for Input via Callback and returns entered text.
 */
export default class TSInputTextExpression extends BaseTSExpression {
  prompt: TSExpression;
  defaultValue: TSExpression;

  constructor(defaultValue: TSExpression, prompt: TSExpression) {
    super();
    this.defaultValue = defaultValue;
    this.prompt = prompt;
  }

  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const prompt = (await this.prompt.evaluate(evalcontext)).asString().trim();
    const value = (await this.defaultValue.evaluate(evalcontext)).asString().trim();
    const result = await evalcontext.promptForInputText(prompt, value);
    return new SingleTSExpressionResult(result);
  }

  getExpression(): string {
    return `{InputText~${this.defaultValue.getExpression()},${this.prompt.getExpression()}}`;
  }
}
