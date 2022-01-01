import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressions from './tsexpressions';

/**
 * Loop expression for iterating given number of times over a block.
 */
class TSLoopExpression implements TSExpression {
  counterExpression: TSExpression;
  block: TSExpressions;
  constructor(counterExpression: TSExpression, block: TSExpressions) {
    this.counterExpression = counterExpression;
    this.block = block;
  }
  evaluate(): string {
    let result = '';
    const maxValueString = this.counterExpression.evaluate();
    const maxValue = Number.parseInt(maxValueString);
    if (Number.isNaN(maxValue)) throw `Loop counter does not evalute to integer value but to '${maxValueString}'`;
    for (let i = 0; i < maxValue; i++) {
      result += this.block.evaluate();
    }
    return result;
  }

  getExpression(): string {
    const counter = this.counterExpression.getExpression(),
      block = this.block.getExpression();
    return `{Loop~${counter},${block}}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSLoopExpression;
