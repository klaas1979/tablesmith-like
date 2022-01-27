import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';
import TSExpressions from './tsexpressions';

/**
 * A simple boolean comparison between to TSExpressions, based on TS comparision operators.
 */
class BooleanComparison implements TSExpression {
  ifExpression1: TSExpressions;
  operator: string;
  ifExpression2: TSExpressions;
  constructor(ifExpression1: TSExpressions, operator: string, ifExpression2: TSExpressions) {
    this.ifExpression1 = ifExpression1;
    this.operator = operator;
    this.ifExpression2 = ifExpression2;
  }

  evaluate(): TSExpressionResult {
    let boolResult;
    try {
      const e1 = this.ifExpression1.evaluate().asString(),
        e2 = this.ifExpression2.evaluate().asString();
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
          return new TSExpressionResult('-1'); // error should throw
      }
      return new TSExpressionResult(boolResult ? '1' : '0');
    } catch (error) {
      return new TSExpressionResult('-1');
    }
  }

  getExpression(): string {
    const e1 = this.ifExpression1.getExpression(),
      e2 = this.ifExpression2.getExpression();
    return `${e1}${this.operator}${e2}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

function int(val: string) {
  const int = Number.parseInt(val);
  if (Number.isNaN(int)) throw `Could not convert '${val}' to integer for If comparison!`;
  return int;
}

export default BooleanComparison;
