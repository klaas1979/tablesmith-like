import { tstables } from '../tstables';
import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Expression to give back range value from group.
 */
class TSGroupRangeValueExpression implements TSExpression {
  functionname: string;
  tablename: string;
  groupExpression: TSExpression;
  rangeExpression: TSExpression;
  constructor(functionname: string, tablename: string, groupExpression: TSExpression, rangeExpression: TSExpression) {
    this.functionname = functionname;
    this.tablename = tablename;
    this.groupExpression = groupExpression;
    this.rangeExpression = rangeExpression;
  }
  evaluate(): string {
    const groupname = this.groupExpression.evaluate();
    const group = tstables.tableForName(this.tablename)?.groupForName(groupname);
    if (!group) throw `Cannot Count group '${groupname}' in table '${groupname}', not defined!`;
    const rangeIndexString = this.rangeExpression.evaluate();
    const rangeIndex = Number.parseInt(rangeIndexString);
    if (Number.isNaN(rangeIndex)) throw `Index for '${this.functionname}' is no number '${rangeIndexString}'`;
    if (rangeIndex <= 0 || group.getRanges().length < rangeIndex)
      throw `Index for '${this.functionname}' out of bounds='${rangeIndexString}'`;
    let result;
    switch (this.functionname) {
      case 'MinVal':
        result = group.getRanges()[rangeIndex - 1].getLower();
        break;
      case 'MaxVal':
        result = group.getRanges()[rangeIndex - 1].getUpper();
        break;
      default:
        throw `Functionname='${this.functionname}' is unknown for Min/MaxVal`;
    }
    return `${result}`;
  }

  getExpression(): string {
    return `{${this.functionname}~${this.groupExpression.getExpression()},${this.rangeExpression.getExpression()}}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSGroupRangeValueExpression;
