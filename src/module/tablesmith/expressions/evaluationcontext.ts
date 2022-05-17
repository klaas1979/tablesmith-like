import TSGroup from '../tsgroup';
import twist from '../../helpers/mersennetwister';
import { NoteTSExpressionResult, RerollableTSExpressionResult } from './tsexpressionresult';
import { generateUUID } from '../../helpers/uuid';
import { InputListCallback, InputTextCallback, MsgCallback, StatusCallback } from '../inputcallbacktypes';
import TSGenerateExpression from './tsgenerateexpression';
import { DSStores } from '../dsstore/dsstores';
import { DSStore } from '../dsstore/dsstore';

/**
 * Class providing all needed context for an evaluation, including rolling results, Variables and Parameters
 * from tables.
 */
class EvaluationContext {
  variables: Map<string, Map<string, undefined | string | number>>;
  callTables: string[];
  lastRolls: Map<TSGroup, number>;
  readStores: Map<string, DSStore>;
  storedRerollables: Map<string, RerollableTSExpressionResult>;
  storedNotes: Map<string, NoteTSExpressionResult>;
  dsStores: DSStores | undefined;
  rerollState: boolean;
  inputListCallback: InputListCallback | undefined;
  inputTextCallback: InputTextCallback | undefined;
  msgCallback: MsgCallback | undefined;
  statusCallback: StatusCallback | undefined;
  constructor(options?: {
    readStores?: Map<string, DSStore>;
    storedRerollables?: Map<string, RerollableTSExpressionResult>;
    storedNotes?: Map<string, NoteTSExpressionResult>;
    storedGenerateExpressions?: Map<TSGenerateExpression, boolean>;
    rerollState?: boolean;
  }) {
    this.variables = new Map();
    this.callTables = [];
    this.lastRolls = new Map();
    this.readStores = options?.readStores ? options.readStores : new Map();
    this.storedRerollables = options?.storedRerollables ? options.storedRerollables : new Map();
    this.storedNotes = options?.storedNotes ? options.storedNotes : new Map();
    this.rerollState = options?.rerollState ? options.rerollState : false;
  }

  /**
   * Clone of EvaluationContext for Rerollable Expressions like Generate or Groups with Reroll Tag.
   * @returns Clone of this EvaluationContext for Rerollable Expressions.
   */
  clone(): EvaluationContext {
    const clone = new EvaluationContext({
      readStores: this.readStores,
      storedRerollables: this.storedRerollables,
    });
    if (this.inputListCallback) clone.registerInputListCallback(this.inputListCallback);
    if (this.inputTextCallback) clone.registerInputTextCallback(this.inputTextCallback);
    if (this.msgCallback) clone.registerMsgCallback(this.msgCallback);
    if (this.statusCallback) clone.registerStatusCallback(this.statusCallback);
    for (const mapTuple of this.variables) {
      const varMap: Map<string, undefined | string | number> = new Map();
      clone.variables.set(mapTuple[0], varMap);
      for (const varTuple of mapTuple[1]) {
        varMap.set(varTuple[0], varTuple[1]);
      }
    }
    clone.callTables.push(...this.callTables);
    for (const tuple of this.lastRolls) {
      clone.lastRolls.set(tuple[0], tuple[1]);
    }
    return clone;
  }

  /**
   * Stores given TSExpressionResult under unique ID and returns the ID.
   * @param rerollable to store.
   * @returns id for stored result.
   */
  storeRerollable(rerollable: RerollableTSExpressionResult): string {
    const id = generateUUID();
    this.storedRerollables.set(id, rerollable);
    return id;
  }

  /**
   * Stores given TSExpressionResult under unique ID and returns the ID.
   * @param note to store.
   * @returns id for stored result.
   */
  storeNote(note: NoteTSExpressionResult): string {
    const id = generateUUID();
    this.storedNotes.set(id, note);
    return id;
  }

  /**
   * Returns RerollableTSExpressionResult for UUID.
   * @param uuid to get Rerollable for.
   * @returns rerollable for UUID or undefined, if nothing stored.
   */
  retrieveRerollable(uuid: string): RerollableTSExpressionResult | undefined {
    return this.storedRerollables.get(uuid);
  }

  /**
   * Returns NoteTSExpressionResult for UUID.
   * @param uuid to get Note for.
   * @returns note for UUID or undefined, if nothing stored.
   */
  retrieveNote(uuid: string): NoteTSExpressionResult | undefined {
    return this.storedNotes.get(uuid);
  }

  /**
   * Sets to reroll state for generate expressions.
   */
  setToReroll() {
    this.rerollState = true;
  }

  /**
   * Checks if state is reroll for generate expressions.
   * @returns boolean true if should be (re)rolled.
   */
  isReroll(): boolean {
    return this.rerollState;
  }

  /**
   * Returns the last roll result.
   * @param group to get last roll result for
   * @returns number the last roll for given group.
   */
  getLastRoll(group: TSGroup): number {
    const roll = this.lastRolls.get(group);
    if (!roll) throw Error(`LastRoll for '${group.name}' not set!`);
    return roll;
  }

  /**
   * Returns the last roll result.
   * @param group to get last roll result for
   * @param roll number to set as last roll for given group.
   */
  setLastRoll(group: TSGroup, roll: number): void {
    this.lastRolls.set(group, roll);
  }

  /**
   * Returns a Tablesmith variable.
   * @param tablename to get variable from.
   * @param variablename to get for table.
   * @returns value of variable can be string, number or undefined.
   */
  getVar(tablename: string | undefined, variablename: string): undefined | string | number {
    const lookupTablename = !tablename ? this.getCurrentCallTablename() : tablename;
    const table = this.variables.get(lookupTablename);
    if (!table || !table?.has(variablename))
      throw Error(`Variable '${variablename}' not defined for Table '${lookupTablename}'`);
    return table.get(variablename);
  }

  /**
   * Pushes the currently evaluated tablename on top of the Stack.
   * @param name tablename to push on top of the current call tablename stack.
   */
  pushCurrentCallTablename(name: string) {
    this.callTables.push(name);
  }

  /**
   * Removes latest table from current call table stack.
   */
  popCurrentCallTablename() {
    this.callTables.pop();
  }

  /**
   * Returns the current table evaluation is happening in.
   * @returns string tablename for current table evaluation runs in.
   */
  getCurrentCallTablename(): string {
    return this.callTables[this.callTables.length - 1];
  }

  /**
   * Sets Tablesmith variable to given value.
   * @param tablename to set variable in.
   * @param variablename for variable to set value for.
   * @param value to set, may be string, number or undefined.
   */
  assignVar(tablename: undefined | string, variablename: string, value: undefined | string | number) {
    const lookupTablename = !tablename ? this.getCurrentCallTablename() : tablename;
    let table = this.variables.get(lookupTablename);
    if (!table) {
      table = new Map();
      this.variables.set(lookupTablename, table);
    }
    table.set(variablename, value);
  }

  /**
   * Rolls as defined and returns result.
   * @param sides number of sides for die to roll.
   * @returns total of roll.
   */
  roll(sides: number): number {
    const random = twist.random();
    return Math.ceil(random * sides);
  }

  /**
   * Creates DSStore into variable.
   * @param variable to store DSStore in, key to retrieve it later.
   * @param dsStore to store for variable.
   */
  createDSStore(variable: string, dsStore: DSStore) {
    this.readStores.set(variable, dsStore);
  }
  /**
   * Reads DSStore into variable.
   * @param variable to store DSStore in, key to retrieve it later.
   * @param storename to read from Backend.
   */
  async readDSStore(variable: string, storename: string) {
    if (!this.dsStores) throw Error('Could not read DSStore, the DSStores backend is not initialized!');
    const dsStore = await this.dsStores.get(storename);
    this.createDSStore(variable, dsStore);
  }
  /**
   * Writes DSStore into backend.
   * @param variable of DSStore to write.
   * @param storename to write data to in Backend.
   */
  async writeDSStore(variable: string, storename: string) {
    if (!this.dsStores) throw Error('Could not write DSStore, the DSStores backend is not initialized!');
    const store = this.readStores.get(variable);
    if (!store) throw Error(`No DSStore defined for variable '${variable}' cannot write to backend '${storename}'!`);
    store.setName(storename);
    await this.dsStores.save(store);
  }
  /**
   * Returns the value of field in entry at index for named store.
   * @param variable name of varialbe DSStore is saved in.
   * @param index of Entry to get field from.
   * @param fieldName to get.
   * @returns string value of field for entry.
   */
  getDSStoreEntryField(variable: string, index: number, fieldName: string): string {
    const store = this.readStores.get(variable);
    if (!store) throw Error(`No DSStore defined for variable '${variable}', cannot get field for entry!`);
    const value = store.getEntryField(index, fieldName);
    return value;
  }

  getProperty<T, K extends keyof T>(o: T, propertyName: K): T[K] {
    return o[propertyName]; // o[propertyName] is of type T[K]
  }

  /**
   * Calls the InputText callback and returns its result.
   * @param prompt to show as question when asking for input selection.
   * @param defaultValue as index starting at 1.
   * @returns The selected item index 1 based.
   */
  async promptForInputList(defaultValue: number, prompt: string, options: string[]): Promise<number> {
    if (!this.inputListCallback) throw Error('No InputText Callback is set, cannot prompt for text!');
    return this.inputListCallback(defaultValue, prompt, options);
  }

  /**
   * Calls the InputText callback and returns its result.
   * @param prompt to show as question when asking for input text.
   * @param defaultValue for text.
   * @returns The result for the prompt.
   */
  async promptForInputText(prompt: string, defaultValue: string): Promise<string> {
    if (!this.inputTextCallback) throw Error('No InputText Callback is set, cannot prompt for text!');
    return this.inputTextCallback(prompt, defaultValue);
  }

  /**
   * Shows message prompt to user.
   * @param prompt to show as question when asking for input text.
   */
  async promptMsg(prompt: string): Promise<void> {
    if (!this.msgCallback) throw Error('No Msg Callback is set, cannot prompt message!');
    return this.msgCallback(prompt);
  }

  /**
   * Shows message prompt to user.
   * @param prompt to show as question when asking for input text.
   */
  async setStatus(status: string): Promise<void> {
    if (!this.statusCallback) throw Error('No Status Callback is set, cannot set status!');
    return this.statusCallback(status);
  }

  /**
   * Registers the async callback function for InputList.
   * @param callback to register as external input function, if a TS InputList is encountered.
   */
  registerInputListCallback(callback: InputListCallback): void {
    this.inputListCallback = callback;
  }

  /**
   * Registers the async callback function for InputText.
   * @param callback to register as external input function, if a TS InputText is encountered.
   */
  registerInputTextCallback(callback: InputTextCallback): void {
    this.inputTextCallback = callback;
  }

  /**
   * Registers the async callback function for Msg.
   * @param callback to register as external msg function.
   */
  registerMsgCallback(callback: MsgCallback): void {
    this.msgCallback = callback;
  }

  /**
   * Registers the async callback function for Status.
   * @param callback to register as external Status function.
   */
  registerStatusCallback(callback: StatusCallback): void {
    this.statusCallback = callback;
  }

  /**
   * Registers the DSStores to use as backend.
   * @param dsStores to register as backend.
   */
  registerDSStores(dsStores: DSStores): void {
    this.dsStores = dsStores;
  }
}

export default EvaluationContext;
