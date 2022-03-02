import { Logger } from '../../foundry/logger';
import { DSStore } from './dsstore';

const GAME_ACTORS = 'game.actors';
const GAME_CARDS = 'game.cards';
const GAME_COMBATS = 'game.combats';
const GAME_ITEMS = 'game.items';
const GAME_JOURNAL = 'game.journal';
const GAME_USERS = 'game.users';
const GAME_SCENES = 'game.scenes';
const GAME_TABLES = 'game.tables';
export const GAME_DATA = [
  GAME_ACTORS,
  GAME_CARDS,
  GAME_COMBATS,
  GAME_ITEMS,
  GAME_JOURNAL,
  GAME_USERS,
  GAME_SCENES,
  GAME_TABLES,
];

/**
 * Dataset store based on an array of unknown objects.
 */
export class GameDSStore implements DSStore {
  game: Game;
  name: string;
  constructor(name: string, game: Game) {
    this.name = name;
    this.game = game;
  }

  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  setName(name: string): void {
    throw new Error(`Could not set name on GameDSStore, read only!`);
  }

  private getData():
    | StoredDocument<Actor>[]
    | StoredDocument<Cards>[]
    | StoredDocument<Combat>[]
    | StoredDocument<Item>[]
    | StoredDocument<JournalEntry>[]
    | StoredDocument<User>[]
    | StoredDocument<Scene>[]
    | StoredDocument<RollTable>[] {
    let result;
    Logger.debug(false, 'game data', this.game);
    switch (this.name) {
      case GAME_ACTORS:
        result = this.game.actors;
        break;
      case GAME_CARDS:
        result = this.game.cards;
        break;
      case GAME_COMBATS:
        result = this.game.combats;
        break;
      case GAME_ITEMS:
        result = this.game.items;
        break;
      case GAME_JOURNAL:
        result = this.game.journal;
        break;
      case GAME_USERS:
        result = this.game.users;
        break;
      case GAME_SCENES:
        result = this.game.scenes;
        break;
      case GAME_TABLES:
        result = this.game.tables;
        break;
      default:
        throw Error(`Could not get data for '${this.name}', unknown!`);
    }
    if (!result) throw Error(`Could not get data for '${this.name}', undefined!`);
    return result.contents;
  }

  /**
   * Creates a new Entry initialized with default vales and pushes it to end of store.
   * @returns newly created entry, that is already added to store.
   */
  createEntry(): object {
    throw Error(`Cannot create new entry in GameDSStore '${this.name}', read only`);
  }

  /**
   * Removes index from store.
   * @param index to remove from store.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  removeEntry(index: number) {
    throw Error(`Cannot remove entry from GameDSStore '${this.name}', read only`);
  }

  /**
   * Returns number of stored entries.
   * @returns number of stored entries.
   */
  size(): number {
    return this.getData().length;
  }

  /**
   * Returns all fields for entries in this Store.
   * @returns all field names as string[];
   */
  getFields(): string[] {
    throw Error(`getFields() Not implemented yet`);
  }

  /**
   * Returns if field exists for name.
   * @param name of field to check.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  hasField(name: string): boolean {
    throw Error(`hasField() Not implemented yet`);
  }

  /**
   * Adds field that is valid for this DSStore object.
   * @param name to add as valid field.
   * @param defaultvalue to set for field.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  addField(name: string, defaultvalue: string) {
    throw Error(`addField() Not implemented yet`);
  }

  /**
   * Returns the value of field in entry at index.
   * @param index of Entry to get field from.
   * @param fieldName to get, can be a dotted notation to a deep linked field.
   * @returns string value of field for entry.
   */
  getEntryField(index: number, fieldName: string): string {
    const realIndex = this.realIndex(index);
    const entry = this.getData()[realIndex];
    if (!entry)
      throw Error(
        `Cannot get '${fieldName}' for index '${index}' using realIndex '${realIndex}' in '${this.name}', entry is undefined!`,
      );
    return this.getFieldValue(entry, fieldName);
  }

  /**
   * Returns field value from given object, throws if undefined.
   * @param entry to retrieve fieldName from.
   * @param fieldName to retrieve, may be a deep link via dotted "." notation.
   * @returns value for field.
   */
  private getFieldValue(
    entry:
      | StoredDocument<Actor>
      | StoredDocument<Cards>
      | StoredDocument<Combat>
      | StoredDocument<Item>
      | StoredDocument<JournalEntry>
      | StoredDocument<User>
      | StoredDocument<Scene>
      | StoredDocument<RollTable>,
    fieldName: string,
  ) {
    let result: object = entry.toObject();
    const traversed: string[] = [];
    fieldName.split('.').forEach((field) => {
      traversed.push(field);
      const props = Object.getOwnPropertyNames(result);
      if (props.includes(field)) {
        result = result[field as keyof typeof result];
      } else
        throw Error(`Field '${traversed.join('.')}' undefined for '${this.name}', has properties: ${props.join(', ')}`);
    });
    return `${result}`;
  }

  /**
   * Transforms Tablesmith Dataset index to index of underlying collection.
   * @param index to get real index for
   * @returns real index of underlying collection.
   */
  private realIndex(index: number): number {
    return index - 1;
  }

  /**
   * Returns all values as string array for given field.
   * @param fieldName to get values for.
   * @returns array of all field values.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  fieldValues(fieldName: string): string[] {
    const result = this.getData().map((e) => {
      return this.getFieldValue(e, fieldName);
    });
    Logger.debug(false, 'fieldValues', fieldName, result);
    return result;
  }

  /**
   * Filters Dataset and returns all indices that match value with operator.
   * @param startIndex for search.
   * @param fieldName to filter value in.
   * @param operator as string for comparison operation.
   * @param value to compare to with operator.
   * @returns all indices that match the filter.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  filter(startIndex: number, fieldName: string, operator: string, value: string): number[] {
    throw Error(`filter() Not implemented yet`);
  }

  private fieldMatches(fieldValue: string, operator: string, value: string) {
    let result = false;
    const fieldAsNumber = Number.parseFloat(fieldValue);
    const valueAsNumber = Number.parseFloat(value);
    const asNumber = !Number.isNaN(fieldAsNumber) && !Number.isNaN(valueAsNumber);
    switch (operator) {
      case '<':
        result = asNumber ? fieldAsNumber < valueAsNumber : fieldValue < value;
        break;
      case '>':
        result = asNumber ? fieldAsNumber > valueAsNumber : fieldValue > value;
        break;
      case '=':
      case '~':
        result = asNumber ? fieldAsNumber === valueAsNumber : fieldValue === value;
        break;
      case '<=':
        result = asNumber ? fieldAsNumber <= valueAsNumber : fieldValue <= value;
        break;
      case '>=':
        result = asNumber ? fieldAsNumber >= valueAsNumber : fieldValue >= value;
        break;
      case '!=':
      case '!~':
        result = asNumber ? fieldAsNumber != valueAsNumber : fieldValue != value;
        break;
      default:
        throw Error(`Unknown operator for field comparision '${operator}'`);
    }
    return result;
  }

  /**
   * Shuffles this DSStore.
   */
  shuffle(): void {
    throw Error(`Cannot shuffle GameDSStore '${this.name}', read only!`);
  }

  /**
   * Returns entry.
   * @param index of entry.
   * @returns entry at index.
   */
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  getEntry(index: number): object {
    throw Error(`getEntry() Not implemented yet`);
  }

  /**
   * Name of this store.
   * @returns name.
   */
  getName(): string {
    return this.name;
  }

  /**
   * Serializes this store to JSON and returns it.
   * @returns string JSON.stringify for stores data.
   */
  getDataAsJsonString(): string {
    throw Error(`Cannot serialize GameDSStore '${this.name}', read only!`);
  }
}
