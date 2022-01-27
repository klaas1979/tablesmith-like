import TSGroup from '../../tsgroup';
import TSExpression from '../tsexpression';
import TSExpressionResult from '../tsexpressionresult';

export default class DiceCalcTerm implements TSExpression {
  functionName: string;
  innerTerm: TSExpression;
  constructor(functionName: string, innerDiceTerm: TSExpression) {
    this.functionName = functionName;
    this.innerTerm = innerDiceTerm;
  }
  getExpression(): string {
    return `{${this.functionName}~${this.innerTerm.getExpression()}}`;
  }
  evaluate(): TSExpressionResult {
    return this.innerTerm.evaluate();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty nothing must be set for this expression
  }
}
