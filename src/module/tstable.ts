import { evalcontext } from './expressions/evaluationcontextinstance';
import TSGroup from './tsgroup';

/**
 * A single table or tablesmith file, tables can contain many groups to be rolled upon.
 */
class TSTable {
  groups: TSGroup[];
  name: string;

  constructor(name: string) {
    this.groups = [];
    this.name = name;
  }

  /**
   * Returns table's name.
   * @returns name of the Table, normally the filename.
   */
  getName(): string {
    return this.name;
  }

  /**
   * Returns table's Groups.
   * @returns Array of all groups in table.
   */
  getGroups(): TSGroup[] {
    return this.groups;
  }

  /**
   * Searches for Group with given name and returns it.
   * @param name of group to search.
   * @returns Group for name or undefined if not contained.
   */
  groupForName(name: string): TSGroup | undefined {
    return this.groups.find((group) => group.name === name);
  }

  /**
   * Declares a variale in this table with optional default value.
   * @param variablename to add to this table.
   * @param value default value to initialize the variable with.
   */
  declareVariable(variablename: string, value: string | undefined) {
    evalcontext.assignVar(this.name, variablename, value);
  }

  /**
   * Adds empty Group with given name.
   * @param name of new group, must be unique or throws.
   * @param rangeAsProbabilty should range values added to the group by interpreted as probability values 'true' for yes.
   * @returns TSGroup the newly created and added group.
   * @param nonRepeating should results on this group be only be drawn once, in multiply evaluatios.
   */
  addGroup(name: string, rangeAsProbabilty: boolean, nonRepeating: boolean): TSGroup {
    if (this.groupForName(name)) throw `Group name already defined got '${name}'`;
    const tsGroup = new TSGroup(name, rangeAsProbabilty, nonRepeating);
    this.groups.push(tsGroup);
    return tsGroup;
  }
}

export default TSTable;
