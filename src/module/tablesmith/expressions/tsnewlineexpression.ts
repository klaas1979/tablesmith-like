import EvaluationContext from './evaluationcontext';
import { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Expression representing the "{CR~}" function.
 */
export default class TSNewlineExpression extends BaseTSExpression {
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    return new SingleTSExpressionResult('<br/>');
  }
  getExpression(): string {
    return '{CR~}';
  }
}
