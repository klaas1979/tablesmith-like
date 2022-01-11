import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
class TSLastRollExpression implements TSExpression {
  group: TSGroup | undefined;
  evaluate(): string {
    if (!this.group) throw `Group not set, cannot evaluate LastRoll}`;
    const result = this.group.getLastRoll();
    return `${result}`;
  }
  getExpression(): string {
    return `{LastRoll~}`;
  }
  setGroup(group: TSGroup): void {
    this.group = group;
  }
}

export default TSLastRollExpression;
