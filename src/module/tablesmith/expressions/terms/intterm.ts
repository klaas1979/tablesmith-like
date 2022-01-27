import TSGroup from '../../tsgroup';
import TSExpression from '../tsexpression';
import TSExpressionResult from '../tsexpressionresult';

/**
 * Represents an Integer number as Term.
 */
export default class IntTerm implements TSExpression {
  int: number;
  constructor(int: number) {
    this.int = int;
  }
  getExpression(): string {
    return `${this.int}`;
  }
  evaluate(): TSExpressionResult {
    return new TSExpressionResult(this.int);
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty nothing must be set for this expression
  }
}
