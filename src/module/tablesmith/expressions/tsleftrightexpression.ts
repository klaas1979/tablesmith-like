import EvaluationContext from './evaluationcontext';
import { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
import TSExpressions from './tsexpressions';

/**
 * Left and Right Function.
 */
export default class TSLeftRightExpression extends BaseTSExpression {
  name: string;
  numberExpression: TSExpressions;
  textExpression: TSExpressions;
  constructor(name: string, numberExpression: TSExpressions, textExpression: TSExpressions) {
    super();
    this.name = name;
    this.numberExpression = numberExpression;
    this.textExpression = textExpression;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const number = (await this.numberExpression.evaluate(evalcontext)).asInt();
    const text = (await this.textExpression.evaluate(evalcontext)).asString();
    const length = text.length;
    if (number < 0 || number > length)
      throw Error(`Cannot get '${this.name}' number '${number}' out of bounds 0-${length}`);
    let result;
    switch (this.name) {
      case 'Char':
        result = text.slice(number - 1, number);
        break;
      case 'Left':
        result = text.slice(0, number);
        break;
      case 'Right':
        result = text.slice(length - number);
        break;
      default:
        throw Error(`Unknown function '${this.name}'`);
    }
    return new SingleTSExpressionResult(result);
  }

  getExpression(): string {
    return `{${this.name}~${this.numberExpression.getExpression()},${this.textExpression.getExpression()}}`;
  }
}
