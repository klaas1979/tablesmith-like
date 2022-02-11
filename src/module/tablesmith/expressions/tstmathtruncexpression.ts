import EvaluationContext from './evaluationcontext';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Math Trunc function on contained expression, drops all decimal places.
 */
export default class TSMathTruncExpression extends BaseTSExpression {
  param: TSExpression;
  constructor(param: TSExpression) {
    super();
    this.param = param;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const valueString = (await this.param.evaluate(evalcontext)).asString();
    const value = Number.parseInt(valueString);
    if (Number.isNaN(value)) throw Error(`Could not get Trunc for non number value '${valueString}'!`);
    return new SingleTSExpressionResult(value);
  }
  getExpression(): string {
    return `{Trunc~${this.param.getExpression()}}`;
  }
}
