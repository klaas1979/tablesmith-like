import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';

/**
 * Expression to evaluate / roll on a tables group. If modifier is "=" set fixed result to true and add
 * Term defining the fixed result. If "+" or "-" are used as modifier add Term that describes the modifier
 * the modifer.
 */
export default class TSFindExpression extends BaseTSExpression {
  private indexExpression: TSExpression;
  private searchExpression: TSExpression;
  private textExpression: TSExpression;
  constructor(indexExpression: TSExpression, searchExpression: TSExpression, textExpression: TSExpression) {
    super();
    this.indexExpression = indexExpression;
    this.searchExpression = searchExpression;
    this.textExpression = textExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const index = (await this.indexExpression.evaluate(evalcontext)).asInt();
    const search = (await this.searchExpression.evaluate(evalcontext)).asString();
    const text = (await this.textExpression.evaluate(evalcontext)).asString();
    const found = text.indexOf(search, index - 1);
    return new SingleTSExpressionResult(found + 1);
  }

  getExpression(): string {
    const index = this.indexExpression.getExpression();
    const search = this.searchExpression.getExpression();
    const text = this.textExpression.getExpression();
    return `{Find~${index},${search},${text}}`;
  }
}
