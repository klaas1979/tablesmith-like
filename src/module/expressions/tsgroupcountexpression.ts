import { tablesmith } from '../tablesmithinstance';
import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
class TSGroupCountExpression implements TSExpression {
  tablename: string;
  groupExpression: TSExpression;
  constructor(tablename: string, groupExpression: TSExpression) {
    this.tablename = tablename;
    this.groupExpression = groupExpression;
  }
  evaluate(): string {
    const groupname = this.groupExpression.evaluate();
    const group = tablesmith.tableForName(this.tablename)?.groupForName(groupname);
    if (!group) throw `Cannot Count group '${groupname}' in table '${groupname}', not defined!`;
    return `${group.count()}`;
  }

  getExpression(): string {
    return `{Count~${this.groupExpression.getExpression()}}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSGroupCountExpression;
