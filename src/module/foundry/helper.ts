import TablesmithApi from './tablesmithapi';

export const TABLESMITH_ID = 'tablesmith-like';
export const PACK_FLAG_FOLDER = 'folder';

export const SETTING_CHAT = 'default-chat';
export const SETTING_IMPORT_FOLDERS = 'journal-import-folders';
export const SETTING_TSD_JOURNAL = 'journal-tsd-name';
export const SETTING_TSD_FOLDER = 'journal-tsd-folder';

/**
 * Returns game instance if initialized.
 * Helper to access Types see: https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/FAQ
 * @returns The current game instance.
 */
export function getGame(): Game {
  if (!(game instanceof Game)) {
    throw new Error('game is not initialized yet!');
  }
  return game;
}

/**
 * Returns Journal Entry that contains all Dataset as separate flags.
 * Helper to access Types see: https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/FAQ
 * @returns stored Journal entry containing the datasets as flags.
 */
export async function getTsdJournal(journalName: string): Promise<StoredDocument<JournalEntry>> {
  const folderName = tsdJournalFolder();
  let tsd = getJournal().contents.find((j) => {
    return j.name === journalName && j.folder?.name === folderName;
  });
  if (!tsd) {
    let folder = getFolders().contents.find((f) => f.name === folderName);
    if (!folder) folder = await Folder.create({ name: folderName, type: 'JournalEntry' });
    tsd = await JournalEntry.create({ name: journalName, folder: folder });
  }
  if (!tsd)
    throw Error(`Could not load nor create Journal for TSD files folder '${folderName}' tsd-file '${journalName}'`);
  return tsd;
}

/**
 * Returns Journal Entry that contains all Dataset as separate flags.
 * Helper to access Types see: https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/FAQ
 * @returns stored Journal entry containing the datasets as flags.
 */
export async function getTsdJournals(): Promise<StoredDocument<JournalEntry>[]> {
  const folderName = tsdJournalFolder();
  return getJournal().contents.filter((j) => {
    return j.name?.match(/.*\.tsd/) && j.folder?.name === folderName;
  });
}

/**
 * Returns folders instance if initialized.
 * Helper to access Types see: https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/FAQ
 * @returns The folders instance from game.
 */
export function getFolders(): Folders {
  const folders = getGame().folders;
  if (!(folders instanceof Folders)) throw new Error('folders is not initialized yet!');
  return folders;
}

/**
 * Returns journal instance if initialized.
 * Helper to access Types see: https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/FAQ
 * @returns The journal instance from game.
 */
export function getJournal(): Journal {
  const journal = getGame().journal;
  if (!(journal instanceof Journal)) throw new Error('journal is not initialized yet!');
  return journal;
}

/**
 * Returns macrois instance if initialized.
 * Helper to access Types see: https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/FAQ
 * @returns The macros instance from game.
 */
export function getMacros(): Macros {
  const macros = getGame().macros;
  if (!(macros instanceof Macros)) {
    throw new Error('macros is not initialized yet!');
  }
  return macros;
}

/**
 * Searches macro for name and returns it.
 * @param name of marcro to find.
 * @returns Macro for name or null if not found.
 */
export function findMacro(name: string): StoredDocument<Macro> | undefined {
  const macro = getMacros().find((macro) => {
    return macro.name == name;
  });
  return macro;
}

/**
 * Returns packs instance if initialized.
 * Helper to access Types see: https://github.com/League-of-Foundry-Developers/foundry-vtt-types/wiki/FAQ
 * @returns The packs instance from game.
 */
export function getPacks(): Collection<CompendiumCollection<CompendiumCollection.Metadata>> {
  const packs = getGame().packs;
  if (packs === undefined) throw Error('packs are not initialized yet!');
  return packs;
}

interface TablesmithModuleData {
  api: TablesmithApi;
}
/**
 * Initialization helper, to set API.
 * @param api to set to Tablesmith game module.
 */
export function setTablesmithApi(api: TablesmithApi): void {
  const data = getGame().modules.get(TABLESMITH_ID) as unknown as TablesmithModuleData;
  data.api = api;
}

/**
 * Returns the set tablesmith API.
 * @returns TablesmithApi from games module.
 */
export function getTablesmithApi(): TablesmithApi {
  const data = getGame().modules.get(TABLESMITH_ID) as unknown as TablesmithModuleData;
  return data.api;
}

/**
 * Returns the chat Results setting.
 * @returns boolean true if results should be chatted by default, false if not.
 */
export function chatResults(): boolean {
  const chat = getGame().settings.get(TABLESMITH_ID, SETTING_CHAT);
  return chat !== undefined && `${chat}` === 'true';
}
/**
 * All folders of module Journal tables to import.
 * @returns string[] of all folders.
 */
export function importFolders(): string[] {
  const folders = getGame().settings.get(TABLESMITH_ID, SETTING_IMPORT_FOLDERS) as string;
  return folders !== undefined ? folders.split(',') : [];
}
/**
 * Setting name for the TSD Data Folder.
 * @returns name for the Tablesmith Dataset Folder.
 */
export function tsdJournalFolder(): string {
  const folder = getGame().settings.get(TABLESMITH_ID, SETTING_TSD_FOLDER) as string;
  return folder !== undefined ? `${folder}` : 'Tablesmith';
}
