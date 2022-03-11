import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult, NoteTSExpressionResult } from './tsexpressionresult';
import TSInputTextExpression from './tsinputtextexpression';
import TSTextExpression from './tstextexpression';

/**
 * Expression that asks for Input via Callback and returns entered text.
 */
export default class TSNoteExpression extends BaseTSExpression {
  textExpression: TSExpression;

  constructor(textExpression: TSExpression) {
    super();
    this.textExpression = textExpression;
  }

  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const text = (await this.textExpression.evaluate(evalcontext)).asString().trim();
    const textResult = new SingleTSExpressionResult(text);
    const textExpressionForInput = new TSTextExpression(text);
    const inputTextExpression = new TSInputTextExpression(textExpressionForInput, textExpressionForInput);
    return new NoteTSExpressionResult(evalcontext, textResult, inputTextExpression);
  }

  getExpression(): string {
    return `{Note~${this.textExpression.getExpression()}}`;
  }
}
