import { JournalEntryData } from '@league-of-foundry-developers/foundry-vtt-types/src/foundry/common/data/module.mjs';
import Tablesmith from '../tablesmith/tablesmith';
import { tablesmith } from '../tablesmith/tablesmithinstance';
import { getGame, getJournal, getPacks, importFolders, PACK_FLAG_FOLDER, TABLESMITH_ID } from './helper';
import { Logger } from './logger';

const parseErrors: ParseError[] = [];
const tablesmithExtension = 'tab';
type ParseError = {
  foldername: string;
  tablename: string;
  error: string;
};

class JournalTables {
  /** Loads all tables from Tablesmith Journal Folder. */
  static async loadTablesFromJournal(): Promise<ParseError[]> {
    for (const entry of getJournal().contents) {
      if (JournalTables.isTablesmithTable(entry.name)) {
        const tablename = JournalTables.tableBasename(entry.name);
        const folder = this.tableFolder(entry.folder?.name);
        Logger.info(false, `Found Tablesmith folder '${entry.folder?.name}' table '${entry.name}'`, entry.data.content);
        JournalTables.addTableHandleErrors(tablesmith, folder, tablename, entry.data.content);
      }
    }
    await this.loadTablesFromPacks();
    return this.getParseErrors();
  }
  /** Loads all tables from Compendium of this module. */
  static async loadTablesFromPacks(): Promise<ParseError[]> {
    for (const compendiumCollection of getPacks()) {
      const metadata = compendiumCollection.metadata;
      if (metadata.name.match(`${TABLESMITH_ID}.*`) && metadata.type === 'JournalEntry') {
        const tableEntries = await compendiumCollection.getDocuments();
        for (const tableEntry of tableEntries) {
          let folder = tableEntry.getFlag(TABLESMITH_ID, PACK_FLAG_FOLDER) as string;
          folder = this.tableFolder(folder);
          const data = tableEntry.data as JournalEntryData;
          if (importFolders().includes(folder)) {
            Logger.info(
              false,
              `Found Table in Pack '${metadata.name}' folder '${folder}' table '${data.name}'`,
              data.content,
            );
            JournalTables.addTableHandleErrors(tablesmith, folder, data.name, data.content);
          } else
            Logger.info(
              false,
              `Skipping Table in Pack '${metadata.name}' folder '${folder}' table '${
                data.name
              }' import Folders '${importFolders().join(',')}'`,
            );
        }
      }
    }
    return this.getParseErrors();
  }

  static tableFolder(folder: string | undefined | null): string {
    return folder ? folder : getGame().i18n.localize('TABLESMITH.default-folder');
  }

  /**
   * Reloads all tables from journal and removes table that do not exist anymore in journal.
   * @returns all parse errors encountered.
   */
  static async reloadTablesFromJournal(): Promise<ParseError[]> {
    tablesmith.reset();
    return this.loadTablesFromJournal();
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
      JournalTables.removeParseError(foldername, tablename);
    } catch (error) {
      const e = error as Error;
      JournalTables.addParseError(foldername, tablename, e.message);
      Logger.warn(false, 'Error adding table', foldername, tablename, error);
    }
  }

  /**
   * Returns all parsing errors.
   * @returns all parse errors.
   */
  static getParseErrors(): ParseError[] {
    return parseErrors;
  }

  /**
   * Adds a parse error.
   * @param foldername of table.
   * @param tablename of error table.
   */
  private static addParseError(foldername: string, tablename: string, error: string) {
    this.removeParseError(foldername, tablename);
    parseErrors.push({ foldername: foldername, tablename: tablename, error: error });
  }

  /**
   * Creates the key parse Errors are stored with.
   * @param foldername of table.
   * @param tablename of error table.
   */
  private static removeParseError(foldername: string, tablename: string) {
    const index = parseErrors.findIndex((entry) => {
      return entry.foldername === foldername && entry.tablename === tablename;
    });
    if (index != -1) parseErrors.splice(index, 1);
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
    if (journalName == null) throw Error('Could not get entry basename for missing journal bame!');
    return journalName.trim().replace(`.${tablesmithExtension}`, '');
  }
}

export default JournalTables;
