import Evalcontext from '../evaluationcontext';
import TSExpression from '../tsexpression';
import Term from './term';
import TermResult from './termresult';

/**
 * Represents an Integer number as Term.
 */
class TSExpressionWrapperTerm implements Term {
  expression: TSExpression;
  constructor(expression: TSExpression) {
    this.expression = expression;
  }
  getTerm(): string {
    return `${this.expression.getExpression()}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  roll(evalcontext: Evalcontext): TermResult {
    const stringResult = this.expression.evaluate();
    const num = Number.parseInt(stringResult);
    if (Number.isNaN(num)) throw `Wrapped Expression did not resolve to number but to '${stringResult}'`;
    return new TermResult(num, stringResult);
  }
}

export default TSExpressionWrapperTerm;
