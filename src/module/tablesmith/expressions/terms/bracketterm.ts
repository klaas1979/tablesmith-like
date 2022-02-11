import TSExpression, { BaseTSExpression } from '../tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from '../tsexpressionresult';

/**
 * A mathematical Bracket to order the evaluation of mathematical expressions.
 * All operations within the bracket are added to a single term.
 */
export default class BracketTerm extends BaseTSExpression {
  term: TSExpression;
  constructor(term: TSExpression) {
    super();
    this.term = term;
  }

  getExpression(): string {
    return `(${this.term.getExpression()})`;
  }

  async evaluate(): Promise<TSExpressionResult> {
    return this.term.evaluate();
  }
}
