import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
class TSLastRollExpression implements TSExpression {
  group: TSGroup | undefined;
  evaluate(): string {
    if (!this.group) throw 'Group not set, cannot evaluate last roll';
    const lastRoll = this.group.getLastRoll();
    return `${lastRoll.total}`;
  }
  getExpression(): string {
    return `{LastRoll~}`;
  }
  setGroup(group: TSGroup): void {
    this.group = group;
  }
}

export default TSLastRollExpression;
