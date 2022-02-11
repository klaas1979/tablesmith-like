import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Math Round function on contaned expression.
 */
export default class TSMathRoundExpression extends BaseTSExpression {
  param: TSExpression;
  decimalPlaces: TSExpression;
  constructor(param: TSExpression, decimalPlaces: TSExpression) {
    super();
    this.param = param;
    this.decimalPlaces = decimalPlaces;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const value = (await this.param.evaluate(evalcontext)).asNumber();
    const decimalPlacesString = (await this.decimalPlaces.evaluate(evalcontext)).asString();
    const decimalPlaces = Number.parseInt(decimalPlacesString);
    return new SingleTSExpressionResult(value.toFixed(decimalPlaces));
  }
  getExpression(): string {
    return `{Round~${this.decimalPlaces.getExpression()},${this.param.getExpression()}}`;
  }
}
