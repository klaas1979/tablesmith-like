import { getGame } from '../../foundry/helper';
import { DSStore } from './dsstore';
import { GameDSStore, GAME_DATA } from './gamedsstore';
import { ObjectArrayDSStore } from './objectarraydsstore';

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
    let result;
    if (GAME_DATA.includes(storename)) {
      result = new GameDSStore(storename, getGame());
    } else {
      const jsonData = await this.db.get(storename);
      if (!jsonData) throw Error(`Could not get DSStore for name '${storename}'`);
      const data = JSON.parse(jsonData) as Map<string, string>[];
      result = new ObjectArrayDSStore(storename, data);
    }
    return result;
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
