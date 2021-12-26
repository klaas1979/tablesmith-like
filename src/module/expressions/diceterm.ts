import Roller from './roller';
import Term from './term';
import TermResult from './termresult';

/**
 * Term for a dice roll, containing one or many dice rolls possible chained by math expressions,
 * i.e. 3d6+2d4.
 */
class DiceTerm implements Term {
  dice: Term;
  sides: Term;
  constructor(dice: Term, sides: Term) {
    this.dice = dice;
    this.sides = sides;
  }

  roll(roller: Roller): TermResult {
    let result = '';
    let total = 0;
    const concreteDices = this.dice.roll(roller);
    const concreteSides = this.sides.roll(roller);
    for (let i = 0; i < concreteDices.total; i++) {
      const roll = roller.roll(concreteSides.total).total;
      result += i == 0 ? roll : `+${roll}`;
      total += roll;
    }

    return new TermResult(total, result);
  }

  getTerm() {
    return `${this.dice.getTerm()}d${this.sides.getTerm()}`;
  }
}

export default DiceTerm;
