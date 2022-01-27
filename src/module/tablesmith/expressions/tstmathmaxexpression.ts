import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Math max function to get bigger of the two values.
 */
class TSMathMaxExpression implements TSExpression {
  values: TSExpression[];
  constructor(values: TSExpression[]) {
    this.values = values;
  }
  evaluate(): TSExpressionResult {
    const nums = this.values.map((value) => value.evaluate().asNumber());
    return new TSExpressionResult(Math.max(...nums));
  }
  getExpression(): string {
    const expressions = this.values.reduce(
      (all, cur) => (all.length > 0 ? all + ',' + cur.getExpression() : cur.getExpression()),
      '',
    );
    return `{Max~${expressions}}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSMathMaxExpression;
