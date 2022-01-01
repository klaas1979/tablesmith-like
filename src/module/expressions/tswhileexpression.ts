import TSGroup from '../tsgroup';
import TSExpression from './tsexpression';
import TSExpressions from './tsexpressions';

/**
 * Ternary if expression for TS-Function IIf ":" or If "/".
 */
class TSWhileExpression implements TSExpression {
  checkExpression: TSExpression;
  block: TSExpressions;
  constructor(checkExpression: TSExpression, block: TSExpressions) {
    this.checkExpression = checkExpression;
    this.block = block;
  }
  evaluate(): string {
    let result = '';
    let checkResult = this.checkExpression.evaluate();
    let counter = 0;
    while (checkResult != '0') {
      result += this.block.evaluate();
      checkResult = this.checkExpression.evaluate();
      counter += 1;
      if (counter > 100000) throw `TSWhileExpression.evaluate() looped 100000 times, aborting: ${this.getExpression()}`;
    }
    return result;
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
