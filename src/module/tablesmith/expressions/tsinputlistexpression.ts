import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Expression that asks for Input from a selected set of options via Callback and returns entered text.
 */
export default class TSInputListExpression extends BaseTSExpression {
  defaultValue: TSExpression;
  prompt: TSExpression;
  options: TSExpression[];

  constructor(defaultValue: TSExpression, prompt: TSExpression, options: TSExpression[]) {
    super();
    this.defaultValue = defaultValue;
    this.prompt = prompt;
    this.options = options;
  }

  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const value = (await this.defaultValue.evaluate(evalcontext)).asNumber();
    if (value < 1 || value > this.options.length)
      throw Error(`InputText defaultValue index out of bounds was=${value}, bounds '1-${this.options.length}`);
    const prompt = (await this.prompt.evaluate(evalcontext)).asString().trim();
    const options = [];
    for (const option of this.options) {
      const result = await option.evaluate(evalcontext);
      options.push(result.asString());
    }
    const result = await evalcontext.promptForInputList(value, prompt, options);
    return new SingleTSExpressionResult(result);
  }

  getExpression(): string {
    const options = this.options.map((e) => e.getExpression()).join(',');
    return `{InputList~${this.defaultValue.getExpression()},${this.prompt.getExpression()},${options}}`;
  }
}
