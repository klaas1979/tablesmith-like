import { tstables } from '../tstables';
import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Expression to give Count in a group.
 */
class TSGroupCountExpression implements TSExpression {
  tablename: string;
  groupExpression: TSExpression;
  constructor(tablename: string, groupExpression: TSExpression) {
    this.tablename = tablename;
    this.groupExpression = groupExpression;
  }
  evaluate(): TSExpressionResult {
    const groupname = this.groupExpression.evaluate().trim();
    const group = tstables.tableForName(this.tablename)?.groupForName(groupname);
    if (!group) throw `Cannot Count group '${groupname}' in table '${groupname}', not defined!`;
    return new TSExpressionResult(group.count());
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
