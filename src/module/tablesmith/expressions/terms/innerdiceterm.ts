import { evalcontext } from '../evaluationcontextinstance';
import TSExpression, { BaseTSExpression } from '../tsexpression';
import TSExpressionResult from '../tsexpressionresult';
/**
 * Inner Term for a dice roll, containing one or many dice rolls with possible to be chained by math expressions,
 * i.e. 3d6+2d4. The inner dice while not add Function name to term, but only the bare dice term.
 */
export default class InnerDiceTerm extends BaseTSExpression {
  dice: TSExpression;
  sides: TSExpression;
  constructor(dice: TSExpression, sides: TSExpression) {
    super();
    this.dice = dice;
    this.sides = sides;
  }

  async evaluate(): Promise<TSExpressionResult> {
    let total = 0;
    const concreteDices = (await this.dice.evaluate()).asNumber();
    const concreteSides = (await this.sides.evaluate()).asNumber();
    for (let i = 0; i < concreteDices; i++) {
      const roll = evalcontext.roll(concreteSides);
      total += roll;
    }

    return new TSExpressionResult(total);
  }

  getExpression(): string {
    return `${this.dice.getExpression()}d${this.sides.getExpression()}`;
  }
}
