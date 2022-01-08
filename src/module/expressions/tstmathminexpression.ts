import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';

/**
 * Math min function to get smaller of the two values.
 */
class TSMathMinExpression implements TSExpression {
  values: TSExpression[];
  constructor(values: TSExpression[]) {
    this.values = values;
  }
  evaluate(): string {
    const nums = this.values.map((value) => Number.parseFloat(value.evaluate()));
    if (nums.find((num) => Number.isNaN(num)) != undefined)
      throw `Could not evaluate min not all values numbers '${nums.join(',')}'`;
    return `${Math.min(...nums)}`;
  }
  getExpression(): string {
    const expressions = this.values.reduce(
      (all, cur) => (all.length > 0 ? all + ',' + cur.getExpression() : cur.getExpression()),
      '',
    );
    return `{Min~${expressions}}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSMathMinExpression;
