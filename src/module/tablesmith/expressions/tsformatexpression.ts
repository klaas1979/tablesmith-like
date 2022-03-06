import EvaluationContext from './evaluationcontext';
import { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
import TSExpressions from './tsexpressions';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
export default class TSFormatExpression extends BaseTSExpression {
  name: string;
  expressions: TSExpressions;
  constructor(name: string, expressions: TSExpressions) {
    super();
    this.name = name;
    this.expressions = expressions;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const text = await this.expressions.evaluate(evalcontext);
    let result;
    switch (this.name) {
      case 'Bold':
        result = new SingleTSExpressionResult(`<b>${text.asString()}</b>`);
        break;
      case 'Italic':
        result = new SingleTSExpressionResult(`<em>${text.asString()}</em>`);
        break;
      default:
        throw Error(`Unknown Format function '${this.name}!'`);
    }
    return result;
  }
  getExpression(): string {
    return `{${this.name}~${this.expressions.getExpression()}}`;
  }
}
