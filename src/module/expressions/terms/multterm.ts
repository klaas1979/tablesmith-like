import BaseMathTerm from './basemathterm';
import Term from './term';
import TermCalc from './termcalc';

/**
 * MultTerm is used for "*" calculations.
 */
class MultTerm extends BaseMathTerm implements TermCalc {
  constructor(termA: Term, termB: Term) {
    super(termA, termB);
    super.termCalc = this;
  }

  calc(a: number, b: number): number {
    return a * b;
  }
  operator(): string {
    return '*';
  }
}

export default MultTerm;
