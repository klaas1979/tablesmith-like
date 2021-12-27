import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Expression representing the "{CR~}" function.
 */
class TSNewlineExpression implements TSExpression {
  evaluate(): string {
    return '<br/>';
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
