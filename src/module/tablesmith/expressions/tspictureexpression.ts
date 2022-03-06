import EvaluationContext from './evaluationcontext';
import { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
import TSExpressions from './tsexpressions';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
export default class TSPictureExpression extends BaseTSExpression {
  pathExpression: TSExpressions;
  constructor(pathExpression: TSExpressions) {
    super();
    this.pathExpression = pathExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const path = (await this.pathExpression.evaluate(evalcontext)).asString();
    return new SingleTSExpressionResult(`<img src="${path}" />`);
  }
  getExpression(): string {
    return `{Picture~${this.pathExpression.getExpression()}}`;
  }
}
