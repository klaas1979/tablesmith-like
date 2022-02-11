import EvaluationContext from '../evaluationcontext';
import TSExpression, { BaseTSExpression } from '../tsexpression';
import { TSExpressionResult } from '../tsexpressionresult';

export default class TSDiceCalcExpression extends BaseTSExpression {
  functionName: string;
  innerTerm: TSExpression;
  constructor(functionName: string, innerDiceTerm: TSExpression) {
    super();
    this.functionName = functionName;
    this.innerTerm = innerDiceTerm;
  }
  getExpression(): string {
    return `{${this.functionName}~${this.innerTerm.getExpression()}}`;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    return this.innerTerm.evaluate(evalcontext);
  }
}
