import Evalcontext from '../evaluationcontext';
import Term from './term';
import TermResult from './termresult';

/**
 * Inner Term for a dice roll, containing one or many dice rolls with possible to be chained by math expressions,
 * i.e. 3d6+2d4. The inner dice while not add Function name to term, but only the bare dice term.
 */
class InnerDiceTerm implements Term {
  dice: Term;
  sides: Term;
  constructor(dice: Term, sides: Term) {
    this.dice = dice;
    this.sides = sides;
  }

  roll(evalcontext: Evalcontext): TermResult {
    let result = '';
    let total = 0;
    const concreteDices = this.dice.roll(evalcontext);
    const concreteSides = this.sides.roll(evalcontext);
    for (let i = 0; i < concreteDices.total; i++) {
      const roll = evalcontext.roll(concreteSides.total);
      result += i == 0 ? roll : `+${roll}`;
      total += roll;
    }

    return new TermResult(total, result);
  }

  getTerm() {
    return `${this.dice.getTerm()}d${this.sides.getTerm()}`;
  }
}

export default InnerDiceTerm;
