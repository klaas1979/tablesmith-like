import Tablesmith from '../tablesmith/tablesmith';
import { tablesmith } from '../tablesmith/tablesmithinstance';
import { getJournal } from './helper';
import { Logger } from './logger';

const tablesmithExtension = 'tab';
class JournalTables {
  /** Loads all tables from Tablesmith Journal Folder. */
  static async loadTablesFromJournal() {
    getJournal().contents.forEach((entry) => {
      if (JournalTables.isTablesmithTable(entry.name)) {
        Logger.info(false, `Found Tablesmith table '${entry.name}'`);
        const tablename = JournalTables.tableBasename(entry.name);
        JournalTables.addTableHandleErrors(tablesmith, tablename, entry.data.content);
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
   * Checks if journalName donates a Tablesmith table identified by extension in name '.tab'.
   * @param journalName of Jounal entry to check if it is a Tablesmith entry.
   */
  static addTableHandleErrors(tablesmith: Tablesmith, tablename: string, content: string): void {
    try {
      tablesmith.addTable(tablename, content, 'html');
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
