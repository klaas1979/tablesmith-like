import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Simple Line Expression that separates the Output via a Line or other visual cue.
 */
export default class TSLineExpression extends BaseTSExpression {
  alignExpression: TSExpression;
  widthExpression: TSExpression;

  constructor(alignExpression: TSExpression, widthExpression: TSExpression) {
    super();
    this.alignExpression = alignExpression;
    this.widthExpression = widthExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    this.evaluateAlign(evalcontext);
    this.evaluateWidth(evalcontext);
    return new SingleTSExpressionResult(`<br/>`);
  }

  private async evaluateAlign(evalcontext: EvaluationContext): Promise<string> {
    const align = (await this.alignExpression.evaluate(evalcontext)).trim();
    const allowed = ['left', 'center', 'right'];
    if (!allowed.includes(align.toLowerCase()))
      throw Error(`Align was '${align}', allowed values '${allowed.join(',')}'`);
    return align;
  }

  private async evaluateWidth(evalcontext: EvaluationContext) {
    return (await this.widthExpression.evaluate(evalcontext)).asInt();
  }

  getExpression(): string {
    return `{Line~${this.alignExpression.getExpression()},${this.widthExpression.getExpression()}%}`;
  }
}
