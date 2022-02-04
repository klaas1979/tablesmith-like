import { BaseTSExpression } from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
export default class TSTextExpression extends BaseTSExpression {
  text: string;
  constructor(text: string) {
    super();
    this.text = text;
  }

  async evaluate(): Promise<TSExpressionResult> {
    return new TSExpressionResult(this.text);
  }

  getExpression(): string {
    return this.text.replace('%', '/%').replace('[', '/[').replace(']', '/]');
  }
}
