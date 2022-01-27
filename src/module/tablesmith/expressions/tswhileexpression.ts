import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';
import TSExpressions from './tsexpressions';

/**
 * While expression to loop while a condition is true or a value is not "0".
 */
class TSWhileExpression implements TSExpression {
  checkExpression: TSExpression;
  block: TSExpressions;
  constructor(checkExpression: TSExpression, block: TSExpressions) {
    this.checkExpression = checkExpression;
    this.block = block;
  }
  evaluate(): TSExpressionResult {
    let result = '';
    let checkResult = this.checkExpression.evaluate();
    let counter = 0;
    while (checkResult.asString() != '0') {
      result += this.block.evaluate().asString();
      checkResult = this.checkExpression.evaluate();
      counter += 1;
      if (counter > 100000) throw `TSWhileExpression.evaluate() looped 100000 times, aborting: ${this.getExpression()}`;
    }
    return new TSExpressionResult(result);
  }

  getExpression(): string {
    const be = this.checkExpression.getExpression(),
      block = this.block.getExpression();
    return `{While~${be},${block}}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSWhileExpression;
