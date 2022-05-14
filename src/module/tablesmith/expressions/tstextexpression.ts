import EvaluationContext from './evaluationcontext';
import { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
export default class TSTextExpression extends BaseTSExpression {
  text: string;
  constructor(text: string) {
    super();
    this.text = text;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    return new SingleTSExpressionResult(this.text);
  }

  getExpression(): string {
    return this.text
      .replace(/%/g, '/%')
      .replace(/\[/g, '/[')
      .replace(/]/g, '/]')
      .replace(/{/g, '/{')
      .replace(/}/g, '/}');
  }
}
