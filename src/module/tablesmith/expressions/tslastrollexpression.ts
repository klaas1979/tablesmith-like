import TSGroup from '../tsgroup';
import EvaluationContext from './evaluationcontext';
import { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
export default class TSLastRollExpression extends BaseTSExpression {
  group: TSGroup | undefined;
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    if (!this.group) throw Error(`Group not set, cannot evaluate LastRoll}`);
    const result = this.group.getLastRoll(evalcontext);
    return new SingleTSExpressionResult(result);
  }
  getExpression(): string {
    return `{LastRoll~}`;
  }
  setGroup(group: TSGroup): void {
    this.group = group;
  }
}
