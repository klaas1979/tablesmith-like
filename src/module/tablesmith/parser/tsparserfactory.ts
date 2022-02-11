import TSTextExpression from '../expressions/tstextexpression';
import GroupCallModifierTerm from '../expressions/terms/groupcallmodifierterm';
import { TableParameter, TSTable } from '../tstable';
import TSTableGroupBuilder from './tstablegroupbuilder';

/**
 * Factory used by the Peggy Parser to create the in memory representaion of a Tablesmith Table file.
 */
class TSParserFactory {
  table: TSTable;
  groupBuilder: TSTableGroupBuilder | undefined;
  groupCallModifier: GroupCallModifierTerm | undefined;

  constructor(table: TSTable) {
    this.table = table;
  }

  /**
   * Declares a variale in the currently parsed table with optional default value.
   * @param variablename to add to the table.
   * @param value default value to initialize the variable with.
   */
  declareVariable(variablename: string, value: string | undefined) {
    this.table.declareVariable(variablename, value);
  }

  /**
   * Declares a variale in the currently parsed table with optional default value.
   * @param variablename to add to the table.
   * @param value default value to initialize the variable with.
   */
  declareParameter(variablename: string, defaultValue: string, prompt: string, multiList: boolean, options: string[]) {
    const param = new TableParameter(variablename, defaultValue, prompt, multiList, options);
    this.table.declareParameter(param);
  }

  /**
   * Adds empty Group with given name to table and sets it to the currently parsed group.
   * @param name of new group, must be unique or throws.
   * @param rangeAsProbabilty should the range values be interpreted as a probability distribution, or as fixed ranges.
   * @param nonRepeating should results on this group be only be drawn once, in multiply evaluatios.
   */
  addGroup(name: string, rangeAsProbabilty: boolean, nonRepeating: boolean): void {
    const group = this.table.addGroup(name, rangeAsProbabilty, nonRepeating);
    this.groupBuilder = new TSTableGroupBuilder(this.table, group);
  }

  /**
   * Adds a new Range to Group starting after last range or 1 if it is the first and going up to given value and
   * sets this Range up as current expressions to add to.
   * @param upper the number donating the new ranges max value.
   */
  addRange(upper: number): void {
    if (!this.groupBuilder) throw Error(`Cannot add Range without prior defined Group!`);
    this.groupBuilder.addRange(upper);
  }

  /**
   * Setup builder to add before expressions to the current group.
   */
  addBefore(): void {
    if (!this.groupBuilder) throw Error(`Cannot add Before Expressions without prior defined Group!`);
    this.groupBuilder.addBefore();
  }

  /**
   * Setup builder to add after expressions to the current group.
   */
  addAfter(): void {
    if (!this.groupBuilder) throw Error(`Cannot add Before Expressions without prior defined Group!`);
    this.groupBuilder.addAfter();
  }

  /**
   * Creates a new Group Call Expression that takes a defined GroupCallModifier into account.
   * @param rerollable boolean indicating if this group call has the rerollable tag set '~'.
   */
  startGroupCall(rerollable: boolean): void {
    if (!this.groupBuilder) throw Error(`Cannot create Expression without defined Group!`);
    this.groupBuilder.startGroupCall(rerollable);
  }

  /**
   * Creates a new Group Call Expression that takes a defined GroupCallModifier into account.
   * @param table to create a Group call for, may be undefined, then this table is used.
   * @param group to call.
   */
  createGroupCall(): void {
    if (!this.groupBuilder) throw Error(`Cannot create Expression without defined Group!`);
    this.groupBuilder.createGroupCall();
  }

  /**
   * Starts a variable Assignment.
   */
  startVariable(type: 'get' | 'set') {
    if (!this.groupBuilder) throw Error(`Cannot start variable without defined Group!`);
    this.groupBuilder.startVariable(type);
  }

  /**
   * Creates a variable Assignment.
   */
  createVariable() {
    if (!this.groupBuilder) throw Error(`Cannot create variable without defined Group!`);
    this.groupBuilder.createVariable();
  }

  /**
   * Starts TS Function Expression for name.
   * @param name of function to start.
   */
  startFunction(name: string) {
    if (!this.groupBuilder) throw Error(`Cannot start function '${name}' expression, no Group set!`);
    this.groupBuilder.startFunction(name);
  }

  /**
   * Adds a MathTerm like +, -, *, /, ^.
   * @param operator of the math term.
   */
  addMathTerm(operator: string): void {
    if (!this.groupBuilder) throw Error(`Cannot add math term for '${operator}', no Group set!`);
    this.groupBuilder.addMathTerm(operator);
  }

  /**
   * Creates math term for mult and div and dice 'd'.
   */
  createMathMult(): void {
    if (!this.groupBuilder) throw Error(`Cannot create math mult, no Group set!`);
    this.groupBuilder.createMathMult();
  }

  /**
   * Creates math term for plus and minus.
   * @param operator of the math term.
   */
  createMathSum(): void {
    if (!this.groupBuilder) throw Error(`Cannot create math sum, no Group set!`);
    this.groupBuilder.createMathSum();
  }

  /**
   * Called by parser if opening bracket has been found in Math Terms.
   */
  openBracket(): void {
    if (!this.groupBuilder) throw Error(`Cannot open bracket function, no Group set!`);
    this.groupBuilder.openBracket();
  }

  /**
   * Called by parser if closing bracket for math TSExpression has been found.
   */
  closeBracket() {
    if (!this.groupBuilder) throw Error(`Cannot close bracket function, no Group set!`);
    this.groupBuilder.closeBracket();
  }

  /**
   * Creates and adds TS Function Expression that is on top of stack.
   */
  createFunction() {
    if (!this.groupBuilder) throw Error(`Cannot create function, no Group set!`);
    this.groupBuilder.createFunction();
  }

  /**
   * Sets the operator used in boolean expression comparison for if, and, or etc.
   * @param operator to set for boolean expression.
   */
  setBooleanComparisonOperator(operator: string): void {
    if (!this.groupBuilder) throw Error(`Cannot add If Operator, no Group set!`);
    this.groupBuilder.setBooleanComparisonOperator(operator);
  }

  /**
   * Creates a new TSExpression for given text.
   * @param text to create simple TSExpression for.
   */
  createText(text: string): void {
    if (!this.groupBuilder) throw Error(`Cannot create Expression without defined Group!`);
    this.groupBuilder.addExpression(new TSTextExpression(text));
  }

  /**
   * Stacks next Parameter for Group Lock expression.
   */
  stackParameter(): void {
    if (!this.groupBuilder) throw Error(`Cannot stack parameter without defined Group!`);
    this.groupBuilder.stackParameter();
  }

  /**
   * Stacks given string in current context.
   */
  stackString(value: string): void {
    if (!this.groupBuilder) throw Error(`Cannot stack string '${value}' without defined Group!`);
    this.groupBuilder.stackString(value);
  }

  /**
   * The current call and parse stack for easier error handling.
   * @returns string a human readable stack representation.
   */
  getStackRepresentationForError(): string {
    return JSON.stringify(this.groupBuilder?.stack, null, 1);
  }
}

export default TSParserFactory;
