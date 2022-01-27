import TSGroup from '../tsgroup';
import { evalcontext } from './evaluationcontextinstance';
import GroupCallSplitter from './callsplitter';
import TSExpression from './tsexpression';
import TSExpressionResult from './tsexpressionresult';

/**
 * Class representing variable Get returning the value of the variable from table.
 * The variable can be referenced via ([tablename].)?[varname].
 */
class TSVariableGetExpression implements TSExpression {
  tableGroupExpression: TSExpression;
  constructor(tableGroupExpression: TSExpression) {
    this.tableGroupExpression = tableGroupExpression;
  }

  evaluate(): TSExpressionResult {
    const evaluated = this.tableGroupExpression.evaluate();
    const splitted = GroupCallSplitter.forVariable().split(evaluated.asString());
    return new TSExpressionResult(`${evalcontext.getVar(splitted.tablename, splitted.variablename)}`);
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
