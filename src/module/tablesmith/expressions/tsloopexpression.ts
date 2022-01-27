import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';
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
  evaluate(): TSExpressionResult {
    let result = '';
    const maxValue = this.counterExpression.evaluate().asInt();
    for (let i = 0; i < maxValue; i++) {
      result += this.block.evaluate().asString();
    }
    return new TSExpressionResult(result);
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
