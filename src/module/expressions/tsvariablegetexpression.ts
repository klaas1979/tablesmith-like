import TSGroup from '../tsgroup';
import Roller from './roller';
import { roller } from './rollerinstance';
import Term from './terms/term';
import TermResult from './terms/termresult';
import TSExpression from './tsexpression';

/**
 * Class representing a Group Expression referencing a variable value, or a variable reference within a Math calculation.
 * Can function as TSExpression or Term.
 */
class TSVariableGetExpression implements TSExpression, Term {
  tablename: string | undefined;
  variablename: string;
  constructor(tablename: string | undefined, variablename: string) {
    this.tablename = tablename;
    this.variablename = variablename;
  }

  getTerm(): string {
    return this.getExpression();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  roll(roller: Roller): TermResult {
    const value = this.evaluate();
    return new TermResult(Number.parseInt(value), value);
  }

  evaluate(): string {
    return `${roller.getVar(this.tablename, this.variablename)}`;
  }

  getExpression(): string {
    return `%${this.variablename}%`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSVariableGetExpression;
