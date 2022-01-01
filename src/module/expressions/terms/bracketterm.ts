import Roller from '../roller';
import Term from './term';
import TermResult from './termresult';

/**
 * A mathematical Bracket to order the evaluation of mathematical expressions.
 * All operations within the bracket are added to a single term.
 */
class BracketTerm implements Term {
  term: Term;
  constructor(term: Term) {
    this.term = term;
  }

  getTerm(): string {
    return `(${this.term.getTerm()})`;
  }

  roll(roller: Roller): TermResult {
    return this.term.roll(roller);
  }
}

export default BracketTerm;
