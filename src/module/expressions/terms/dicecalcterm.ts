import Evalcontext from '../evaluationcontext';
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
  roll(evalcontext: Evalcontext): TermResult {
    return this.innerTerm.roll(evalcontext);
  }
}

export default DiceCalcTerm;
