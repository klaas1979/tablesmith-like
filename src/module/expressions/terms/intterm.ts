import Roller from '../roller';
import Term from './term';
import TermResult from './termresult';

/**
 * Represents an Integer number as Term.
 */
class IntTerm implements Term {
  int: number;
  constructor(int: number) {
    this.int = int;
  }
  getTerm(): string {
    return `${this.int}`;
  }
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  roll(roller: Roller): TermResult {
    return new TermResult(this.int, this.getTerm());
  }
}

export default IntTerm;
