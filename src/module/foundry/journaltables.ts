import Tablesmith from '../tablesmith/tablesmith';
import { getJournal } from './helper';

const tablesmithExtension = 'tab';
class JournalTables {
  /** Loads all tables from Tablesmith Journal Folder. */
  static async loadTablesFromJournal(tablesmith: Tablesmith) {
    getJournal().contents.forEach((entry) => {
      if (JournalTables.isTablesmithTable(entry.name)) {
        console.log(`Found Tablesmith table ${entry.name}`);
        console.log(`Content\n${entry.data.content}`);
        const tablename = JournalTables.tableBasename(entry.name);
        tablesmith.addTable(tablename, entry.data.content, 'html');
        console.log(`Added table ${tablename}`);
        console.log(tablesmith.evaluate(`[${tablename}]`));
      }
    });
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
