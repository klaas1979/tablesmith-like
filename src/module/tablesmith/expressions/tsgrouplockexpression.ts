import { tstables } from '../tstables';
import TSGroup from '../tsgroup';
import TSExpression, { BaseTSExpression } from './tsexpression';
import { TSExpressionResult, SingleTSExpressionResult } from './tsexpressionresult';
import EvaluationContext from './evaluationcontext';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
export default class TSGroupLockExpression extends BaseTSExpression {
  functionname: string;
  tablename: string;
  groupExpression: TSExpression;
  parameters: TSExpression[];
  constructor(functionname: string, tablename: string, groupExpression: TSExpression, parameters: TSExpression[]) {
    super();
    this.functionname = functionname;
    this.tablename = tablename;
    this.groupExpression = groupExpression;
    this.parameters = parameters;
  }
  async evaluate(evalcontext: EvaluationContext): Promise<TSExpressionResult> {
    const table = tstables.tableForName(this.tablename);
    const groupname = (await this.groupExpression.evaluate(evalcontext)).trim();
    const group = table?.groupForName(groupname);
    if (!group)
      throw Error(`Cannot ${this.functionname} group '${groupname}' in table '${this.tablename}', not defined!`);
    let params = '';
    for (const param of this.parameters) {
      if (params.length > 0) params += ',';
      const paramValue = await param.evaluate(evalcontext);
      params += paramValue.asString();
    }
    for (const range of params.split(',')) {
      const splitted = range.trim().split('-');
      if (splitted.length > 1) {
        let start = Number.parseInt(splitted[0]);
        const end = Number.parseInt(splitted[1]);
        if (Number.isNaN(start) || Number.isNaN(end))
          throw Error(
            `Cannot ${this.functionname} for group '${groupname}' range is no number '${range}', not defined!`,
          );
        while (start <= end) {
          this.changeLockState(group, start);
          start += 1;
        }
      } else {
        this.changeLockState(group, splitted[0]);
      }
    }
    return new SingleTSExpressionResult('');
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
        throw Error(`Cannot Change lock state for functionname '${this.functionname}'`);
    }
  }

  getExpression(): string {
    const gne = this.groupExpression.getExpression();
    let parameters = '';
    for (const param of this.parameters) {
      const paramValue = param.getExpression();
      parameters += `,${paramValue}`;
    }
    return `{${this.functionname}~${gne}${parameters}}`;
  }
}
