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
   * Adds table to this collection.
   */
  addTable(table: TSTable): void {
    this.tables.push(table);
    this.tables.sort((a, b) => a.name.localeCompare(b.name));
    this.addFolder(table.folder);
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
   * Searches table with given name and returns it.
   * @param name of table to retrieve.
   * @returns Table for name or undefined if no table was found.
   */
  tableForName(name: string): TSTable | undefined {
    return this.tables.find((current) => current.getName() === name);
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
   */
  resetEvaluationContext() {
    this.tables.forEach((table) => {
      table.resetEvaluationContext();
    });
  }
}

/**
 * The singleton collection of all tables.
 */
export const tstables = new TSTables();
