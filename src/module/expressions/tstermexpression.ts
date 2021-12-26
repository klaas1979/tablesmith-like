import { roller } from './rollerinstance';
import Term from './term';
import TSExpression from './tsexpression';

/**
 * A TSExpression that is based on Terms and needs to be evaluated to get the correct result,
 * must Term expressions are Dice or Calc expressions.
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
}

export default TSTermExpression;
