import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * TS Function for IsNumber check.
 */
export default class TSIsNumberExpression extends BaseTSExpression {
  expression: TSExpression;
  constructor(expression: TSExpression) {
    super();
    this.expression = expression;
  }
  async evaluate(): Promise<TSExpressionResult> {
    const value = (await this.expression.evaluate()).asString();
    const result = !Number.isNaN(Number.parseFloat(value)) || !Number.isNaN(Number.parseInt(value)) ? '1' : '0';
    return new SingleTSExpressionResult(result);
  }

  getExpression(): string {
    return `{IsNumber~${this.expression.getExpression()}}`;
  }
}
