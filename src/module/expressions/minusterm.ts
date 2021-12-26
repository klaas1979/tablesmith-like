import BaseMathTerm from './basemathterm';
import Term from './term';
import TermCalc from './termcalc';

/**
 * MinusTerm is used for "-" calculations.
 */
class MinusTerm extends BaseMathTerm implements TermCalc {
  constructor(termA: Term, termB: Term) {
    super(termA, termB);
    super.termCalc = this;
  }

  calc(a: number, b: number): number {
    return a - b;
  }
  operator(): string {
    return '-';
  }
}

export default MinusTerm;
