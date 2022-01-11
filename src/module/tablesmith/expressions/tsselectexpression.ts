import TSGroup from '../tsgroup';
import SelectTuple from './selecttuple';
import TSExpression from './tsexpression';
import TSExpressions from './tsexpressions';

/**
 * Select expression for selecting value from given tuples or return a default value.
 */
class TSSelectExpression implements TSExpression {
  selector: TSExpression;
  selectTuples: SelectTuple[];
  defaultValue: TSExpressions;
  constructor(selector: TSExpression, selectTuples: SelectTuple[], defaultValue: TSExpressions) {
    this.selector = selector;
    this.defaultValue = defaultValue;
    this.selectTuples = selectTuples;
  }
  evaluate(): string {
    const selectorValue = this.selector.evaluate().trim();
    let result;
    this.selectTuples.forEach((tuple) => {
      if (tuple.key.evaluate().trim() == selectorValue) result = tuple.value.evaluate();
    });
    return result ? result : this.defaultValue.evaluate();
  }

  getExpression(): string {
    let expression = `{Select~${this.selector.getExpression()}`;
    this.selectTuples.forEach((tuple) => {
      expression += `,${tuple.key.getExpression()},${tuple.value.getExpression()}`;
    });
    const defaultExpression = this.defaultValue.getExpression();
    if (defaultExpression.length > 0) expression += `,${defaultExpression}`;
    return expression + '}';
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSSelectExpression;
