import Evalcontext from '../evaluationcontext';
import Term from './term';
import TermCalc from './termcalc';
import TermResult from './termresult';

/**
 * Basic class for all Math Terms not directly instantiated but extended.
 */
class BaseMathTerm implements Term {
  termA: Term;
  termB: Term;
  termCalc: TermCalc | undefined;
  constructor(termA: Term, termB: Term) {
    this.termA = termA;
    this.termB = termB;
  }

  /**
   * The Term as string.
   * @returns the term's string representation, that is evaluated.
   */
  getTerm(): string {
    if (!this.termCalc) throw 'TermCalc not defined, cannot getTerm!';
    return `${this.termA.getTerm()}${this.termCalc.operator()}${this.termB.getTerm()}`;
  }

  /**
   * Rolls this term with given evalcontext.
   * @param evalcontext Roll support class to get random results.
   * @returns TermResult with math value and representation of calculation.
   */
  roll(evalcontext: Evalcontext): TermResult {
    if (!this.termCalc) throw 'TermCalc not defined, cannot roll for result!';
    const aResult = this.termA.roll(evalcontext),
      bResult = this.termB.roll(evalcontext);
    return new TermResult(
      this.termCalc.calc(aResult.total, bResult.total),
      `${aResult.result}${this.termCalc.operator()}${bResult.result}`,
    );
  }
}

export default BaseMathTerm;
