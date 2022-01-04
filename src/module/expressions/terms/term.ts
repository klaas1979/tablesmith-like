import Evalcontext from '../evaluationcontext';
import TermResult from './termresult';

interface Term {
  getTerm(): string;

  roll(evalcontext: Evalcontext): TermResult;
}

export default Term;
