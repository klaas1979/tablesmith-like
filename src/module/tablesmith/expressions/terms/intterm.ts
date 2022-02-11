import EvaluationContext from '../evaluationcontext';
import { BaseTSExpression } from '../tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from '../tsexpressionresult';

/**
 * Represents an Integer number as Term.
 */
export default class IntTerm extends BaseTSExpression {
  int: number;
  constructor(int: number) {
    super();
    this.int = int;
  }
  getExpression(): string {
    return `${this.int}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    return new SingleTSExpressionResult(this.int);
  }
}
