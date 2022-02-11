import { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Expression representing the "{CR~}" function.
 */
export default class TSNewlineExpression extends BaseTSExpression {
  async evaluate(): Promise<TSExpressionResult> {
    return new SingleTSExpressionResult('<br/>');
  }
  getExpression(): string {
    return '{CR~}';
  }
}
