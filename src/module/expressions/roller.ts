import RollResult from './rollresult';
import twist from './mersennetwister';

/**
 * Random number roll helper for all type of rolls on Groups or in functions.
 */
class Roller {
  rolls: RollResult[];
  variables: Map<string, Map<string, undefined | string | number>>;
  callTables: string[];
  constructor() {
    this.rolls = [];
    this.variables = new Map();
    this.callTables = [];
  }

  /**
   * Returns a Tablesmith variable.
   * @param tablename to get variable from.
   * @param variablename to get for table.
   * @returns value of variable can be string, number or undefined.
   */
  getVar(tablename: string | undefined, variablename: string): undefined | string | number {
    const lookupTablename = !tablename ? this.getCurrentCallTablename() : tablename;
    const table = this.variables.get(lookupTablename);
    if (!table || !table?.has(variablename))
      throw `Variable '${variablename}' not defined for Table '${lookupTablename}'`;
    return table.get(variablename);
  }

  /**
   * Pushes the currently evaluated tablename on top of the Stack.
   * @param name tablename to push on top of the current call tablename stack.
   */
  pushCurrentCallTablename(name: string) {
    this.callTables.push(name);
  }

  /**
   * Removes latest table from current call table stack.
   */
  popCurrentCallTablename() {
    this.callTables.pop();
  }

  /**
   * Returns the current table evaluation is happening in.
   * @returns string tablename for current table evaluation runs in.
   */
  getCurrentCallTablename(): string {
    return this.callTables[this.callTables.length - 1];
  }

  /**
   * Sets Tablesmith variable to given value.
   * @param tablename to set variable in.
   * @param variablename for variable to set value for.
   * @param value to set, may be string, number or undefined.
   */
  assignVar(tablename: undefined | string, variablename: string, value: undefined | string | number) {
    const lookupTablename = !tablename ? this.getCurrentCallTablename() : tablename;
    let table = this.variables.get(lookupTablename);
    if (!table) {
      table = new Map();
      this.variables.set(lookupTablename, table);
    }
    table.set(variablename, value);
  }

  /**
   * Rolls as defined and returns result.
   * @param sides number of sides for die to roll.
   * @param modifier optional, modifier to add/subtract from roll.
   * @returns RollResult for roll.
   */
  roll(sides: number, modifier = 0): RollResult {
    const random = twist.random();
    const result = new RollResult(sides, Math.ceil(random * sides), modifier);
    this.rolls.push(result);
    return result;
  }
}

export default Roller;
