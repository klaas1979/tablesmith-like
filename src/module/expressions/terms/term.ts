import Roller from '../roller';
import TermResult from './termresult';

interface Term {
  getTerm(): string;

  roll(roller: Roller): TermResult;
}

export default Term;
