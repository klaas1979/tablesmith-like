import TSGroup from '../tsgroup';
import twist from '../../helpers/mersennetwister';
import { RerollableTSExpressionResult } from './tsexpressionresult';
import { generateUUID } from '../../helpers/uuid';
import { InputListCallback, InputTextCallback, MsgCallback } from '../inputcallbacktypes';
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
  storedGenerateExpressions: Map<TSGenerateExpression, boolean>;
  dsStores: DSStores | undefined;
  inputListCallback: InputListCallback | undefined;
  inputTextCallback: InputTextCallback | undefined;
  msgCallback: MsgCallback | undefined;
  constructor(options?: {
    readStores?: Map<string, DSStore>;
    storedRerollables?: Map<string, RerollableTSExpressionResult>;
    storedGenerateExpressions?: Map<TSGenerateExpression, boolean>;
  }) {
    this.variables = new Map();
    this.callTables = [];
    this.lastRolls = new Map();
    this.readStores = options?.readStores ? options.readStores : new Map();
    this.storedRerollables = options?.storedRerollables ? options.storedRerollables : new Map();
    this.storedGenerateExpressions = options?.storedGenerateExpressions ? options.storedGenerateExpressions : new Map();
  }

  /**
   * Clone of EvaluationContext for Rerollable Expressions like Generate or Groups with Reroll Tag.
   * @returns Clone of this EvaluationContext for Rerollable Expressions.
   */
  clone(): EvaluationContext {
    const clone = new EvaluationContext({
      readStores: this.readStores,
      storedRerollables: this.storedRerollables,
      storedGenerateExpressions: this.storedGenerateExpressions,
    });
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
  store(rerollable: RerollableTSExpressionResult): string {
    const id = generateUUID();
    this.storedRerollables.set(id, rerollable);
    return id;
  }

  /**
   * Returns RerollableTSExpressionResult for UUID.
   * @param uuid to get Rerollable for.
   * @returns rerollable for UUID or undefined, if nothing stored.
   */
  retrieve(uuid: string): RerollableTSExpressionResult | undefined {
    return this.storedRerollables.get(uuid);
  }

  /**
   * Adds given Generate Expression as evaluated.
   * @param generateExpression to store.
   */
  addGenerated(generateExpression: TSGenerateExpression): void {
    this.storedGenerateExpressions.set(generateExpression, true);
  }

  /**
   * Checks if given Generate Expression has been evaluated evaluated.
   * @param generateExpression to check.
   * @returns boolean true if evaluated once, false if not.
   */
  isGenerated(generateExpression: TSGenerateExpression): boolean {
    const generated = this.storedGenerateExpressions.get(generateExpression);
    return generated === true ? true : false;
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
    store.name = storename;
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
   * Registers the DSStores to use as backend.
   * @param dsStores to register as backend.
   */
  registerDSStores(dsStores: DSStores): void {
    this.dsStores = dsStores;
  }
}

export default EvaluationContext;
