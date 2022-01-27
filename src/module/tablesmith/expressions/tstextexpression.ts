import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
class TSTextExpression implements TSExpression {
  text: string;
  constructor(text: string) {
    this.text = text;
  }

  evaluate(): TSExpressionResult {
    return new TSExpressionResult(this.text);
  }

  getExpression(): string {
    return this.text.replace('%', '/%').replace('[', '/[').replace(']', '/]');
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSTextExpression;
