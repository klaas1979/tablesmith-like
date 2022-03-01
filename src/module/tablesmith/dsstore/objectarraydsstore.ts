import { DSStore } from './dsstore';

/**
 * Dataset store based on an array of unknown objects.
 */
export class ObjectArrayDSStore implements DSStore {
  data: unknown[];
  name: string;
  fields: Map<string, string>;
  constructor(name: string, data: unknown[] = []) {
    this.name = name;
    this.data = data;
    this.fields = new Map();
    if (this.data.length > 0) this.initFields();
  }

  setName(name: string): void {
    this.name = name;
  }

  /**
   * Inializes the fields from definition object in loaded data.
   */
  private initFields(): void {
    const definition = this.getEntry(0);
    Object.getOwnPropertyNames(definition).forEach((p) => {
      this.addField(p, definition[p as keyof object]);
    });
  }

  /**
   * Creates a new Entry initialized with default vales and pushes it to end of store.
   * @returns newly created entry, that is already added to store.
   */
  createEntry(): object {
    const entry = {};
    for (const [field, defaultvalue] of this.fields) {
      Object.defineProperty(entry, field, {
        value: defaultvalue,
        writable: true,
      });
    }
    this.data.push(entry);
    return entry;
  }

  /**
   * Removes index from store.
   * @param index to remove from store.
   */
  removeEntry(index: number) {
    if (index < 1 || index > this.size())
      throw Error(`Can not remove entry index '${index}' out of bounds=1-${this.size()}`);
    this.data.splice(index, 1);
  }

  /**
   * Returns number of stored entries.
   * @returns number of stored entries.
   */
  size(): number {
    return this.data.length - 1;
  }

  /**
   * Returns all fields for entries in this Store.
   * @returns all field names as string[];
   */
  getFields(): string[] {
    return [...this.fields.keys()];
  }

  /**
   * Returns if field exists for name.
   * @param name of field to check.
   */
  hasField(name: string): boolean {
    return this.fields.has(name);
  }

  /**
   * Adds field that is valid for this DSStore object.
   * @param name to add as valid field.
   * @param defaultvalue to set for field.
   */
  addField(name: string, defaultvalue: string) {
    if (this.data.length === 0) this.createEntry();
    Object.defineProperty(this.getEntry(0), name, {
      value: defaultvalue,
      writable: true,
    });
    this.fields.set(name, defaultvalue);
  }

  /**
   * Returns the value of field in entry at index.
   * @param index of Entry to get field from.
   * @param fieldName to get.
   * @returns string value of field for entry.
   */
  getEntryField(index: number, fieldName: string): string {
    if (index < 1 || index > this.size())
      throw Error(`Cannot get field '${fieldName}' for index '${index}' out of bounds '1-${this.size()}`);
    this.checkField(fieldName);
    const fieldValue = this.getEntry(index)[fieldName as keyof object];
    return fieldValue;
  }

  private checkField(fieldName: string) {
    if (!this.fields.has(fieldName))
      throw Error(`Cannot get field '${fieldName}' undefined, valid fields '${[...this.fields.keys()].join(',')}'`);
  }

  /**
   * Returns all values as string array for given field.
   * @param fieldName to get values for.
   * @returns array of all field values.
   */
  fieldValues(fieldName: string): string[] {
    this.checkField(fieldName);
    return this.data.slice(1).map((e) => {
      const entry = e as object;
      return entry[fieldName as keyof object];
    });
  }

  /**
   * Filters Dataset and returns all indices that match value with operator.
   * @param startIndex for search.
   * @param fieldName to filter value in.
   * @param operator as string for comparison operation.
   * @param value to compare to with operator.
   * @returns all indices that match the filter.
   */
  filter(startIndex: number, fieldName: string, operator: string, value: string): number[] {
    this.checkField(fieldName);
    const matches = this.data.slice(startIndex).map((e, index) => {
      const realIndex = index + startIndex;
      const indexMatch = startIndex <= realIndex;
      const entry = e as object;
      const fieldValue = entry[fieldName as keyof object];
      const fieldMatch = this.fieldMatches(fieldValue, operator, value);
      return indexMatch && fieldMatch ? realIndex : -1;
    });
    return matches.filter((i) => {
      return i > 0;
    });
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
    const array = this.data.slice(1);
    let currentIndex = array.length,
      randomIndex;

    // While there remain elements to shuffle...
    while (currentIndex != 0) {
      // Pick a remaining element...
      randomIndex = Math.floor(Math.random() * currentIndex);
      currentIndex--;

      // And swap it with the current element.
      [array[currentIndex], array[randomIndex]] = [array[randomIndex], array[currentIndex]];
    }
    this.data.splice(1, this.data.length - 1, ...array);
  }

  /**
   * Returns entry.
   * @param index of entry.
   * @returns entry at index.
   */
  getEntry(index: number): object {
    return this.data[index] as object;
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
    return JSON.stringify(this.data, this.getFields());
  }
}
