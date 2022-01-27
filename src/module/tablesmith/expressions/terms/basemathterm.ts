import TSGroup from '../../tsgroup';
import TSExpression from '../tsexpression';
import TSExpressionResult from '../tsexpressionresult';
import TermCalc from './termcalc';

/**
 * Basic class for all Math Terms not directly instantiated but extended.
 */
class BaseMathTerm implements TSExpression {
  termA: TSExpression;
  termB: TSExpression;
  termCalc: TermCalc | undefined;
  constructor(termA: TSExpression, termB: TSExpression) {
    this.termA = termA;
    this.termB = termB;
  }

  /**
   * The Term as string.
   * @returns the term's string representation, that is evaluated.
   */
  getExpression(): string {
    if (!this.termCalc) throw 'TermCalc not defined, cannot getTerm!';
    return `${this.termA.getExpression()}${this.termCalc.operator()}${this.termB.getExpression()}`;
  }

  /**
   * Rolls this term with given evalcontext.
   * @param evalcontext Roll support class to get random results.
   * @returns TermResult with math value and representation of calculation.
   */
  evaluate(): TSExpressionResult {
    if (!this.termCalc) throw 'TermCalc not defined, cannot roll for result!';
    const aResult = this.termA.evaluate(),
      bResult = this.termB.evaluate();
    return new TSExpressionResult(this.termCalc.calc(aResult.asNumber(), bResult.asNumber()));
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty nothing must be set for this expression
  }
}

export default BaseMathTerm;
