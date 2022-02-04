import { BaseTSExpression } from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Expression representing the "{CR~}" function.
 */
export default class TSNewlineExpression extends BaseTSExpression {
  async evaluate(): Promise<TSExpressionResult> {
    return new TSExpressionResult('<br/>');
  }
  getExpression(): string {
    return '{CR~}';
  }
}
