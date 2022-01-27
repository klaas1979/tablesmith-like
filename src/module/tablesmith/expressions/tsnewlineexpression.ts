import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Expression representing the "{CR~}" function.
 */
class TSNewlineExpression implements TSExpression {
  evaluate(): TSExpressionResult {
    return new TSExpressionResult('<br/>');
  }
  getExpression(): string {
    return '{CR~}';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSNewlineExpression;
