import Roller from '../roller';
import Term from './term';
import TermResult from './termresult';

class DiceCalcTerm implements Term {
  functionName: string;
  innerTerm: Term;
  constructor(functionName: string, innerDiceTerm: Term) {
    this.functionName = functionName;
    this.innerTerm = innerDiceTerm;
  }
  getTerm(): string {
    return `{${this.functionName}~${this.innerTerm.getTerm()}}`;
  }
  roll(roller: Roller): TermResult {
    return this.innerTerm.roll(roller);
  }
}

export default DiceCalcTerm;
