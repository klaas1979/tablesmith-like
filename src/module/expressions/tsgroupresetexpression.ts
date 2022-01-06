import { tablesmith } from '../tablesmithinstance';
import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
class TSGroupResetExpression implements TSExpression {
  group: TSGroup | undefined;
  tablename: string;
  groupname: string;
  constructor(tablename: string, groupname: string) {
    this.tablename = tablename;
    this.groupname = groupname;
  }
  evaluate(): string {
    const group = tablesmith.tableForName(this.tablename)?.groupForName(this.groupname);
    if (!group) throw `Cannot reset group '${this.groupname}' in table '${this.tablename}', not defined!`;
    group.reset();
    return '';
  }

  getExpression(): string {
    return `{Reset~${this.groupname}}`;
  }
  setGroup(group: TSGroup): void {
    this.group = group;
  }
}

export default TSGroupResetExpression;
