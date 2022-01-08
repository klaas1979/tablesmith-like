import TSGroup from '../tsgroup';
import Evalcontext from './evaluationcontext';
import { evalcontext } from './evaluationcontextinstance';
import Term from './terms/term';
import TermResult from './terms/termresult';
import TSExpression from './tsexpression';

/**
 * Class representing variable Get returning the value of the variable from table.
 * The variable can be referenced via ([tablename].)?[varname].
 */
class TSVariableGetExpression implements TSExpression, Term {
  tableGroupExpression: TSExpression;
  constructor(tableGroupExpression: TSExpression) {
    this.tableGroupExpression = tableGroupExpression;
  }

  getTerm(): string {
    return this.getExpression();
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  roll(evalcontext: Evalcontext): TermResult {
    const value = this.evaluate();
    const roll = Number.parseInt(value);
    if (Number.isNaN(roll)) throw `Variable roll did not give number but '${value}' Term='${this.getTerm()}'`;
    return new TermResult(roll, value);
  }

  evaluate(): string {
    const evaluated = this.tableGroupExpression.evaluate();
    const tableGroup = evaluated.split('.');
    let tablename;
    let variablename;
    switch (tableGroup.length) {
      case 1:
        tablename = evalcontext.getCurrentCallTablename();
        variablename = tableGroup[0];
        break;
      case 2:
        tablename = tableGroup[0];
        variablename = tableGroup[1];
        break;
      default:
        throw `Could not get variable expression did not result in ([tablename].)?[varname] but '${evaluated}'`;
    }
    return `${evalcontext.getVar(tablename, variablename)}`;
  }

  getExpression(): string {
    return `%${this.tableGroupExpression.getExpression()}%`;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setGroup(group: TSGroup): void {
    // empty
  }
}

export default TSVariableGetExpression;
