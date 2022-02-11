import EvaluationContext from './expressions/evaluationcontext';
import { TSTable } from './tstable';

/**
 * The collection of all loaded tables that is used to retrieve instances or load them.
 */
class TSTables {
  tables: TSTable[];
  folders: string[];
  constructor() {
    this.folders = [];
    this.tables = [];
  }

  /**
   * Resets to instance without parsed tables, normally only needed for testing purpose.
   */
  reset(): void {
    this.tables = [];
  }
  /**
   * Adds table to this collection, removes existing instance for same name case insensitive.
   * @param table to add.
   */
  addTable(table: TSTable): void {
    this.deleteForName(table.name);
    this.tables.push(table);
    this.tables.sort((a, b) => a.name.localeCompare(b.name));
    this.addFolder(table.folder);
  }

  /**
   * Deletes table for name ignoring case, if it exists.
   * @param name of table to delete.
   */
  deleteForName(name: string): void {
    const existingIndex = this.tables.findIndex((table) => {
      table.name.toLowerCase() === name.toLowerCase();
    });
    if (existingIndex >= 0) this.tables.splice(existingIndex, 1);
  }

  /**
   * Adds folder ensuring order and not duplicates.
   * @param folder to add to collection of folders.
   */
  private addFolder(folder: string) {
    if (!this.folders.includes(folder)) {
      this.folders.push(folder);
      this.folders.sort((a, b) => a.localeCompare(b));
    }
  }

  /**
   * Searches table with given name and returns it, ignoring case.
   * @param name of table to retrieve, ignoring case.
   * @returns Table for name or undefined if no table was found.
   */
  tableForName(name: string): TSTable | undefined {
    if (name === undefined) return undefined;
    name = name.toLowerCase();
    return this.tables.find((current) => current.getName().toLowerCase() === name);
  }

  /**
   * Searches all tables for given folder and returns them.
   * @param folder to get tables for.
   * @returns Table for name or undefined if no table was found.
   */
  tablesForFolder(folder: { name: string } | string): TSTable[] {
    const name = typeof folder == 'string' ? folder : folder.name;
    return this.tables.filter((current) => current.folder === name);
  }

  /**
   * Returns the tables array object.
   * @returns Array of underlying tables.
   */
  getTSTables(): TSTable[] {
    return this.tables;
  }

  /**
   * Returns lat table wit biggest index.
   * @returns The last table added this instande.
   */
  getLastTSTable(): TSTable {
    return this.tables[this.tables.length - 1];
  }

  /**
   * Resets the EvaluationContext back for all contained tables to ensure that no Groups have locked
   * entries and to set back variables in tables to their default declaration.
   * @param context the EvaluationContext to prepare.
   */
  prepareEvaluationContext(context: EvaluationContext) {
    this.tables.forEach((table) => {
      table.prepareEvaluationContext(context);
    });
  }
}

/**
 * The singleton collection of all tables.
 */
export const tstables = new TSTables();
