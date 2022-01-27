import { tstables } from '../tstables';
import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
class TSGroupLockExpression implements TSExpression {
  functionname: string;
  tablename: string;
  groupExpression: TSExpression;
  parameters: TSExpression[];
  constructor(functionname: string, tablename: string, groupExpression: TSExpression, parameters: TSExpression[]) {
    this.functionname = functionname;
    this.tablename = tablename;
    this.groupExpression = groupExpression;
    this.parameters = parameters;
  }
  evaluate(): TSExpressionResult {
    const table = tstables.tableForName(this.tablename);
    const groupname = this.groupExpression.evaluate().trim();
    const group = table?.groupForName(groupname);
    if (!group) throw `Cannot ${this.functionname} group '${groupname}' in table '${this.tablename}', not defined!`;
    let params = '';
    this.parameters.forEach((param) => {
      if (params.length > 0) params += ',';
      params += param.evaluate().asString();
    });
    params.split(',').forEach((range) => {
      const splitted = range.trim().split('-');
      if (splitted.length > 1) {
        let start = Number.parseInt(splitted[0]);
        const end = Number.parseInt(splitted[1]);
        if (Number.isNaN(start) || Number.isNaN(end))
          throw `Cannot ${this.functionname} for group '${groupname}' range is no number '${range}', not defined!`;
        while (start <= end) {
          this.changeLockState(group, start);
          start += 1;
        }
      } else {
        this.changeLockState(group, splitted[0]);
      }
    });
    return new TSExpressionResult('');
  }

  private changeLockState(group: TSGroup, value: number | string): void {
    const index = Number.parseInt(`${value}`);
    switch (this.functionname) {
      case 'Unlock':
        group.unlock(index);
        break;
      case 'Lockout':
        group.lockout(index);
        break;
      default:
        throw `Cannot Change lock state for functionname '${this.functionname}'`;
    }
  }

  getExpression(): string {
    const gne = this.groupExpression.getExpression();
    let parameters = '';
    this.parameters.forEach((param) => {
      parameters += `,${param.evaluate().asString()}`;
    });
    return `{${this.functionname}~${gne}${parameters}}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSGroupLockExpression;
