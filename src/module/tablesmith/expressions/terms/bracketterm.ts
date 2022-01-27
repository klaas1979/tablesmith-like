import TSGroup from '../../tsgroup';
import TSExpression from '../tsexpression';
import TSExpressionResult from '../tsexpressionresult';

/**
 * A mathematical Bracket to order the evaluation of mathematical expressions.
 * All operations within the bracket are added to a single term.
 */
export default class BracketTerm implements TSExpression {
  term: TSExpression;
  constructor(term: TSExpression) {
    this.term = term;
  }

  getExpression(): string {
    return `(${this.term.getExpression()})`;
  }

  evaluate(): TSExpressionResult {
    return this.term.evaluate();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty nothing must be set for this expression
  }
}
