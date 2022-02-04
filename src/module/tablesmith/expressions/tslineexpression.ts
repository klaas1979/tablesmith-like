import TSExpression, { BaseTSExpression } from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

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
  async evaluate(): Promise<TSExpressionResult> {
    this.evaluateAlign();
    this.evaluateWidth();
    return new TSExpressionResult(`<br/>`);
  }

  private async evaluateAlign(): Promise<string> {
    const align = (await this.alignExpression.evaluate()).trim();
    const allowed = ['left', 'center', 'right'];
    if (!allowed.includes(align.toLowerCase()))
      throw Error(`Align was '${align}', allowed values '${allowed.join(',')}'`);
    return align;
  }

  private async evaluateWidth() {
    return (await this.widthExpression.evaluate()).asInt();
  }

  getExpression(): string {
    return `{Line~${this.alignExpression.getExpression()},${this.widthExpression.getExpression()}%}`;
  }
}
