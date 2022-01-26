import Tablesmith from '../tablesmith/tablesmith';
import { tablesmith } from '../tablesmith/tablesmithinstance';
import { getGame, getJournal } from './helper';
import { Logger } from './logger';

const tablesmithExtension = 'tab';
class JournalTables {
  /** Loads all tables from Tablesmith Journal Folder. */
  static async loadTablesFromJournal() {
    getJournal().contents.forEach((entry) => {
      if (JournalTables.isTablesmithTable(entry.name)) {
        Logger.info(false, `Found Tablesmith folder '${entry.folder?.name}' table '${entry.name}'`, entry.data.content);
        const tablename = JournalTables.tableBasename(entry.name);
        const folder =
          entry.folder && entry.folder.name ? entry.folder.name : getGame().i18n.localize('TABLESMITH.default-folder');
        JournalTables.addTableHandleErrors(tablesmith, folder, tablename, entry.data.content);
      }
    });
  }

  /**
   * Reloads all tables from journal and removes table that do not exist anymore in journal.
   */
  static async reloadTablesFromJournal() {
    tablesmith.reset();
    this.loadTablesFromJournal();
  }

  /**
   * Adds table and handles possible errors.
   * @param tablesmith to add table to.
   * @param foldername of table.
   * @param tablename of table.
   * @param content the file content of table, it's definition.
   */
  static addTableHandleErrors(tablesmith: Tablesmith, foldername: string, tablename: string, content: string): void {
    try {
      tablesmith.addTable(foldername, tablename, content, 'html');
      Logger.debug(false, tablesmith.evaluate(`[${tablename}]`));
    } catch (error) {
      Logger.warn(false, 'Error adding table', tablename, error);
    }
  }

  /**
   * Checks if journalName donates a Tablesmith table identified by extension in name '.tab'.
   * @param journalName of Jounal entry to check if it is a Tablesmith entry.
   */
  static isTablesmithTable(journalName: string | null): boolean {
    return journalName != null && journalName.trim().match(`.*\\.${tablesmithExtension}`) != null;
  }

  /**
   * Checks if journalName donates a Tablesmith table identified by extension in name '.tab'.
   * @param journalName of Jounal entry to check if it is a Tablesmith entry.
   */
  static tableBasename(journalName: string | null): string {
    if (journalName == null) throw 'Could not get entry basename for missing journal bame!';
    return journalName.trim().replace(`.${tablesmithExtension}`, '');
  }
}

export default JournalTables;
