import TSExpression, { BaseTSExpression } from '../tsexpression';
import TSExpressionResult from '../tsexpressionresult';
import TermCalc from './termcalc';

/**
 * Basic class for all Math Terms not directly instantiated but extended.
 */
export class BaseMathTerm extends BaseTSExpression {
  termA: TSExpression;
  termB: TSExpression;
  termCalc: TermCalc | undefined;
  constructor(termA: TSExpression, termB: TSExpression) {
    super();
    this.termA = termA;
    this.termB = termB;
  }

  /**
   * The Term as string.
   * @returns the term's string representation, that is evaluated.
   */
  getExpression(): string {
    if (!this.termCalc) throw Error('TermCalc not defined, cannot getTerm!');
    return `${this.termA.getExpression()}${this.termCalc.operator()}${this.termB.getExpression()}`;
  }

  /**
   * Rolls this term with given evalcontext.
   * @param evalcontext Roll support class to get random results.
   * @returns TermResult with math value and representation of calculation.
   */
  async evaluate(): Promise<TSExpressionResult> {
    {
      if (!this.termCalc) throw Error('TermCalc not defined, cannot roll for result!');
      const aResult = await this.termA.evaluate(),
        bResult = await this.termB.evaluate();
      return new TSExpressionResult(this.termCalc.calc(aResult.asNumber(), bResult.asNumber()));
    }
  }
}
