/**
 * Dataset store based on an array of unknown objects.
 */
export interface DSStore {
  /**
   * Sets name for this Store.
   * @param name to set.
   */
  setName(name: string): void;

  /**
   * Creates a new Entry initialized with default vales and pushes it to end of store.
   * @returns newly created entry, that is already added to store.
   */
  createEntry(): object;

  /**
   * Removes index from store.
   * @param index to remove from store.
   */
  removeEntry(index: number): void;

  /**
   * Returns number of stored entries.
   * @returns number of stored entries.
   */
  size(): number;

  /**
   * Returns all fields for entries in this Store.
   * @returns all field names as string[];
   */
  getFields(): string[];

  /**
   * Returns if field exists for name.
   * @param name of field to check.
   */
  hasField(name: string): boolean;

  /**
   * Adds field that is valid for this DSStore object.
   * @param name to add as valid field.
   * @param defaultvalue to set for field.
   */
  addField(name: string, defaultvalue: string): void;

  /**
   * Returns the value of field in entry at index.
   * @param index of Entry to get field from.
   * @param fieldName to get.
   * @returns string value of field for entry.
   */
  getEntryField(index: number, fieldName: string): string;

  /**
   * Returns all values as string array for given field.
   * @param fieldName to get values for.
   * @returns array of all field values.
   */
  fieldValues(fieldName: string): string[];

  /**
   * Filters Dataset and returns all indices that match value with operator.
   * @param startIndex for search.
   * @param fieldName to filter value in.
   * @param operator as string for comparison operation.
   * @param value to compare to with operator.
   * @returns all indices that match the filter.
   */
  filter(startIndex: number, fieldName: string, operator: string, value: string): number[];

  /**
   * Shuffles this DSStore.
   */
  shuffle(): void;

  /**
   * Returns entry.
   * @param index of entry.
   * @returns entry at index.
   */
  getEntry(index: number): object;

  /**
   * Name of this store.
   * @returns name.
   */
  getName(): string;

  /**
   * Serializes this store to JSON and returns it.
   * @returns string JSON.stringify for stores data.
   */
  getDataAsJsonString(): string;
}
