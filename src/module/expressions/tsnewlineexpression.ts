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
}

export default TSNewlineExpression;
