import TSGroup from '../../tsgroup';
import { evalcontext } from '../evaluationcontextinstance';
import TSExpression from '../tsexpression';
import TSExpressionResult from '../tsexpressionresult';
/**
 * Inner Term for a dice roll, containing one or many dice rolls with possible to be chained by math expressions,
 * i.e. 3d6+2d4. The inner dice while not add Function name to term, but only the bare dice term.
 */
class InnerDiceTerm implements TSExpression {
  dice: TSExpression;
  sides: TSExpression;
  constructor(dice: TSExpression, sides: TSExpression) {
    this.dice = dice;
    this.sides = sides;
  }

  evaluate(): TSExpressionResult {
    let total = 0;
    const concreteDices = this.dice.evaluate().asNumber();
    const concreteSides = this.sides.evaluate().asNumber();
    for (let i = 0; i < concreteDices; i++) {
      const roll = evalcontext.roll(concreteSides);
      total += roll;
    }

    return new TSExpressionResult(total);
  }

  getExpression(): string {
    return `${this.dice.getExpression()}d${this.sides.getExpression()}`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty nothing must be set for this expression
  }
}

export default InnerDiceTerm;
