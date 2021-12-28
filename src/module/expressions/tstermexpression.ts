import TSGroup from '../tsgroup';
import { roller } from './rollerinstance';
import Term from './term';
import TSExpression from './tsexpression';

/**
 * A TSExpression that is based on Terms and needs to be evaluated to get the correct result,
 * most Term expressions are Dice or Calc expressions.
 */
class TSTermExpression implements TSExpression {
  term: Term;

  constructor(term: Term) {
    this.term = term;
  }
  evaluate(): string {
    const rollResult = this.term.roll(roller);
    return `${rollResult.total}`;
  }
  getExpression(): string {
    return this.term.getTerm();
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSTermExpression;
