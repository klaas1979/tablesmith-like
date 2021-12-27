import TSExpression from './expressions/tsexpression';
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
   * Helper function to setup table while parsing.
   * @returns Returns the last added group of this table.
   */
  getCurrentGroup(): TSGroup {
    return this.groups[this.groups.length - 1];
  }

  /**
   * Adds empty Group with given name.
   * @param name of new group, must be unique or throws.
   */
  addGroup(name: string): void {
    if (this.groupForName(name)) throw `Group name already defined got '${name}'`;
    this.groups.push(new TSGroup(name));
  }

  /**
   * Adds Range with upper bound to current Group.
   * @param upper upper value for new range.
   */
  addRange(upper: number): void {
    if (!this.getCurrentGroup()) throw `Group not initialized got upper='${upper}'`;
    this.getCurrentGroup().addRange(upper);
  }

  /**
   * Sets up group before range, that is always added to each table result before other text.
   */
  addBefore(): void {
    if (!this.getCurrentGroup()) throw `Group not initialized got addBefore`;
    this.getCurrentGroup().addBefore();
  }

  /**
   * Sets up group after range, that is always added to each table result after all other text.
   */
  addAfter(): void {
    if (!this.getCurrentGroup()) throw `Group not initialized got addAfter`;
    this.getCurrentGroup().addAfter();
  }

  /**
   * Adds given expression to last range of current group or the before or after part.
   * @param expression to add to currently setup expressions.
   */
  addExpression(expression: TSExpression): void {
    this.getCurrentGroup().addExpression(expression);
  }
}

export default TSTable;
