import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';

/**
 * Replace Expression to replace text with other text.
 */
export default class TSReplaceExpression extends BaseTSExpression {
  private searchExpression: TSExpression;
  private replaceExpression: TSExpression;
  private textExpression: TSExpression;
  constructor(searchExpression: TSExpression, replaceExpression: TSExpression, textExpression: TSExpression) {
    super();
    this.searchExpression = searchExpression;
    this.replaceExpression = replaceExpression;
    this.textExpression = textExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const search = (await this.searchExpression.evaluate(evalcontext)).asString();
    const replace = (await this.replaceExpression.evaluate(evalcontext)).asString();
    const text = (await this.textExpression.evaluate(evalcontext)).asString();
    const replaced = text.replace(this.createSearchRegex(search), replace);
    return new SingleTSExpressionResult(replaced);
  }

  createSearchRegex(regex: string): RegExp {
    const pattern = regex.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'); // $& means the whole matched string
    return new RegExp(pattern, 'g');
  }

  getExpression(): string {
    const search = this.searchExpression.getExpression();
    const replace = this.replaceExpression.getExpression();
    const text = this.textExpression.getExpression();
    return `{Replace~${search},${replace},${text}}`;
  }
}
