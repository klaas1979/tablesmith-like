import EvaluationContext from '../evaluationcontext';
import TSExpression, { BaseTSExpression } from '../tsexpression';
import { TSExpressionResult } from '../tsexpressionresult';

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

  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    return this.term.evaluate(evalcontext);
  }
}
