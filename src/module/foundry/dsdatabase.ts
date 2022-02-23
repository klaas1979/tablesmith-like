import { DSStoreDatabase } from '../tablesmith/dsstore/dsstores';
import { getTsdJournal, getTsdJournals, TABLESMITH_ID } from './helper';
import { Logger } from './logger';

const TSD_JSON_FLAG = 'tsd-json';

export default class DSDatabase implements DSStoreDatabase {
  /**
   * Returns all datastores with their store full key, including Module name and value.
   */
  async datastores(): Promise<Map<string, string>> {
    const datastores = new Map();
    const tsds = await getTsdJournals();
    for (const tsd of tsds) {
      datastores.set(tsd.name, tsd.getFlag(TABLESMITH_ID, TSD_JSON_FLAG) as string);
    }
    Logger.debug(false, 'found datastores', datastores);
    return datastores;
  }

  /**
   * Retrieves a Dataset.
   * @param key of a Dataset.
   * @returns dataset for given key.
   */
  async get(key: string): Promise<string | undefined> {
    const tsd = await getTsdJournal(this.tsdJournalName(key));
    const jsonString = tsd.getFlag(TABLESMITH_ID, TSD_JSON_FLAG) as string;
    Logger.debug(false, 'loaded DSStore', this.tsdJournalName(key), jsonString);
    return jsonString;
  }

  /**
   * Writes a Dataset.
   * @param key to store dataset for.
   * @param value to store.
   */
  async set(key: string, value: string): Promise<void> {
    const tsd = await getTsdJournal(this.tsdJournalName(key));
    tsd.setFlag(TABLESMITH_ID, TSD_JSON_FLAG, value);
    Logger.debug(false, 'wrote DSStore', this.tsdJournalName(key), value);
  }

  private tsdJournalName(key: string): string {
    return `${key}.tsd`;
  }
}
