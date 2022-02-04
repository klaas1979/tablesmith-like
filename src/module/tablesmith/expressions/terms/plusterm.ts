import TSExpression from '../tsexpression';
import { BaseMathTerm } from './basemathterm';
import TermCalc from './termcalc';

/**
 * PlusTerm is used for addtion "+" calculation.
 */
export default class PlusTerm extends BaseMathTerm implements TermCalc {
  constructor(termA: TSExpression, termB: TSExpression) {
    super(termA, termB);
    super.termCalc = this;
  }

  calc(a: number, b: number): number {
    return a + b;
  }
  operator(): string {
    return '+';
  }
}
