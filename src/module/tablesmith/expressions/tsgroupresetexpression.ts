import { tstables } from '../tstables';
import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
class TSGroupResetExpression implements TSExpression {
  tablename: string;
  groupExpression: TSExpression;
  constructor(tablename: string, groupExpression: TSExpression) {
    this.tablename = tablename;
    this.groupExpression = groupExpression;
  }
  evaluate(): TSExpressionResult {
    const groupname = this.groupExpression.evaluate().trim();
    const group = tstables.tableForName(this.tablename)?.groupForName(groupname);
    if (!group) throw `Cannot reset group '${groupname}' in table '${this.tablename}', not defined!`;
    group.reset();
    return new TSExpressionResult('');
  }

  getExpression(): string {
    return `{Reset~${this.groupExpression.getExpression()}}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSGroupResetExpression;
