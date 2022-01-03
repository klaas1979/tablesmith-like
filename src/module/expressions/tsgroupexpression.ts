import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Simple Text Expression as value of a Range in a Group or part of the value, i.e. prefix or suffix to a TermExpression.
 */
class TSGroupExpression implements TSExpression {
  group: TSGroup | undefined;
  functionname: string;
  constructor(functionname: string) {
    this.functionname = functionname;
  }
  evaluate(): string {
    if (!this.group) throw `Group not set, cannot evaluate ${this.functionname}`;
    let result;
    switch (this.functionname) {
      case 'LastRoll':
        result = this.group.getLastRoll().total;
        break;
      case 'MinVal':
        result = this.group.getMinValue();
        break;
      case 'MaxVal':
        result = this.group.getMaxValue();
        break;
      default:
        throw `Group Function for name '${this.functionname}' undefined!`;
    }
    return `${result}`;
  }
  getExpression(): string {
    return `{${this.functionname}~}`;
  }
  setGroup(group: TSGroup): void {
    this.group = group;
  }
}

export default TSGroupExpression;
