import { tstables } from '../tstables';
import TSExpression, { BaseTSExpression } from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
export default class TSGroupResetExpression extends BaseTSExpression {
  tablename: string;
  groupExpression: TSExpression;
  constructor(tablename: string, groupExpression: TSExpression) {
    super();
    this.tablename = tablename;
    this.groupExpression = groupExpression;
  }
  async evaluate(): Promise<TSExpressionResult> {
    const groupname = (await this.groupExpression.evaluate()).trim();
    const group = tstables.tableForName(this.tablename)?.groupForName(groupname);
    if (!group) throw Error(`Cannot reset group '${groupname}' in table '${this.tablename}', not defined!`);
    group.reset();
    return new TSExpressionResult('');
  }

  getExpression(): string {
    return `{Reset~${this.groupExpression.getExpression()}}`;
  }
}
