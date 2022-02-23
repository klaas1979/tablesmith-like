import { DSStore } from './dsstore';

/**
 * DSStoreDatabase provides the Backend to save the Data to any backend.
 */
export type DSStoreDatabase = {
  datastores(): Promise<Map<string, string>>;
  get(key: string): Promise<string | undefined>;
  set(key: string, value: string): Promise<void>;
};

/**
 * DSStores gives access to all stores defined or not defined.
 */
export class DSStores {
  db: DSStoreDatabase;
  constructor(db: DSStoreDatabase) {
    this.db = db;
  }

  /**
   * Returns the parsed Database.
   * @param storename to retrieve.
   * @returns DSStore containing the parsed Datastructure.
   */
  async get(storename: string): Promise<DSStore> {
    const jsonData = await this.db.get(storename);
    if (!jsonData) throw Error(`Could not get DSStore for name '${storename}'`);
    const data = JSON.parse(jsonData) as Map<string, string>[];
    return new DSStore(storename, data);
  }

  /**
   * Saves given DSStore to db.
   * @param dsstore to save.
   */
  async save(dsstore: DSStore): Promise<void> {
    const jsonString = dsstore.getDataAsJsonString();
    await this.db.set(dsstore.getName(), jsonString);
  }
}
