import EvaluationContext from './evaluationcontext';
import { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
import TSExpressions from './tsexpressions';

/**
 * A simple boolean comparison between to TSExpressions, based on TS comparision operators.
 */
export default class BooleanComparison extends BaseTSExpression {
  ifExpression1: TSExpressions;
  operator: string;
  ifExpression2: TSExpressions;
  constructor(ifExpression1: TSExpressions, operator: string, ifExpression2: TSExpressions) {
    super();
    this.ifExpression1 = ifExpression1;
    this.operator = operator;
    this.ifExpression2 = ifExpression2;
  }

  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    let boolResult;
    try {
      const e1 = (await this.ifExpression1.evaluate(evalcontext)).trim(),
        e2 = (await this.ifExpression2.evaluate(evalcontext)).trim();
      switch (this.operator) {
        case '=':
          boolResult = e1 == e2;
          break;
        case '!=':
          boolResult = e1 != e2;
          break;
        case '<':
          boolResult = int(e1) < int(e2);
          break;
        case '>':
          boolResult = int(e1) > int(e2);
          break;
        case '<=':
          boolResult = int(e1) <= int(e2);
          break;
        case '>=':
          boolResult = int(e1) >= int(e2);
          break;
        default:
          return new SingleTSExpressionResult('-1'); // error should throw
      }
      return new SingleTSExpressionResult(boolResult ? '1' : '0');
    } catch (error) {
      return new SingleTSExpressionResult('-1');
    }
  }

  getExpression(): string {
    const e1 = this.ifExpression1.getExpression(),
      e2 = this.ifExpression2.getExpression();
    return `${e1}${this.operator}${e2}`;
  }
}

function int(val: string) {
  const int = Number.parseInt(val);
  if (Number.isNaN(int)) throw Error(`Could not convert '${val}' to integer for If comparison!`);
  return int;
}
