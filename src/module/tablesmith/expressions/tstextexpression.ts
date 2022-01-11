import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
class TSTextExpression implements TSExpression {
  text: string;
  constructor(text: string) {
    this.text = text;
  }
  evaluate(): string {
    return this.text;
  }
  getExpression(): string {
    return this.text;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSTextExpression;
