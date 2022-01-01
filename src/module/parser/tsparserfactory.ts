import IntTerm from '../expressions/terms/intterm';
import TSTextExpression from '../expressions/tstextexpression';
import GroupCallModifierTerm from '../expressions/terms/groupcallmodifierterm';
import TSGroupCallExpression from '../expressions/tsgroupcallexpression';
import TSNewlineExpression from '../expressions/tsnewlineexpression';
import TSBoldExpression from '../expressions/tsboldexpression';
import TSLineExpression from '../expressions/tslineexpression';
import TSLastRollExpression from '../expressions/tslastrollexpression';
import TSVariableGetExpression from '../expressions/tsvariablegetexpression';
import TSVariableSetExpression from '../expressions/tsvariablesetexpression';
import TSTable from '../tstable';
import TSTableGroupBuilder from './tstablegroupbuilder';
import MathTermExpressionBuilder from './mathtermexpressionbuilder';
import ParserStack from './parserstack';

/**
 * Factory used by the Peggy Parser to create the in memory representaion of a Tablesmith Table file.
 */
class TSParserFactory {
  table: TSTable;
  groupBuilder: TSTableGroupBuilder | undefined;
  parserStack: ParserStack;
  mathBuilder: MathTermExpressionBuilder;
  groupCallModifier: GroupCallModifierTerm | undefined;

  constructor(table: TSTable) {
    this.table = table;
    this.parserStack = new ParserStack();
    this.mathBuilder = new MathTermExpressionBuilder();
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
   * Adds empty Group with given name to table and sets it to the currently parsed group.
   * @param name of new group, must be unique or throws.
   */
  addGroup(name: string): void {
    const group = this.table.addGroup(name);
    this.groupBuilder = new TSTableGroupBuilder(group, this.parserStack);
  }

  /**
   * Adds a new Range to Group starting after last range or 1 if it is the first and going up to given value and
   * sets this Range up as current expressions to add to.
   * @param upper the number donating the new ranges max value.
   */
  addRange(upper: number): void {
    if (!this.groupBuilder) throw `Cannot add Range without prior defined Group!`;
    this.groupBuilder.addRange(upper);
  }

  /**
   * Setup builder to add before expressions to the current group.
   */
  addBefore(): void {
    if (!this.groupBuilder) throw `Cannot add Before Expressions without prior defined Group!`;
    this.groupBuilder.addBefore();
  }

  /**
   * Setup builder to add after expressions to the current group.
   */
  addAfter(): void {
    if (!this.groupBuilder) throw `Cannot add Before Expressions without prior defined Group!`;
    this.groupBuilder.addAfter();
  }

  /**
   * Toggles variable assignment Context on and off. If toggled on the Expressions are collected
   * for the variable assignment and the current expressions stacked away. If toggled of the old expression stack
   * is restored to save Expressions following variable assignment.
   */
  toggleVariableAssigment(): void {
    if (!this.groupBuilder) throw `Cannot toggle a Variable assignment, no Group set!`;
    this.groupBuilder.toggleVariableAssigment();
  }

  /**
   * Starts logical expression with given type.
   * @param type can be "And", "Or" or "Xor".
   */
  startLogicalExpression(type: string) {
    if (!this.groupBuilder) throw `Cannot start if expression, no Group set!`;
    this.groupBuilder.startLogicalExpression(type);
  }

  /**
   * Starts a TS-While Function.
   */
  startWhile() {
    if (!this.groupBuilder) throw `Cannot start while without defined Group!`;
    this.groupBuilder.startWhile();
  }

  /**
   * Starts a TS-Loop Function.
   */
  startLoop() {
    if (!this.groupBuilder) throw `Cannot start loop without defined Group!`;
    this.groupBuilder.startLoop();
  }

  /**
   * Starts a TS-Selecg Function.
   */
  startSelect() {
    if (!this.groupBuilder) throw `Cannot start select without defined Group!`;
    this.groupBuilder.startSelect();
  }

  /**
   * Starts the block to evaluate for while or loop functions.
   */
  startIteratorBlock() {
    if (!this.groupBuilder) throw `Cannot start iterator block without defined Group!`;
    this.groupBuilder.startIteratorBlock();
  }

  /**
   * Starts a TS If Function.
   * @param functionName of the if expression used "If" or "IIf".
   */
  startIf(functionName: string) {
    if (!this.groupBuilder) throw `Cannot start If without defined Group!`;
    this.groupBuilder.startIf(functionName);
  }

  /**
   * Sets the operator used in boolean expression comparison for if, and, or etc.
   * @param operator to set for boolean expression.
   */
  setBooleanComparisonOperator(operator: string): void {
    if (!this.groupBuilder) throw `Cannot add If Operator, no Group set!`;
    this.groupBuilder.setBooleanComparisonOperator(operator);
  }

  /**
   * Starts the true value Expressions for the if.
   */
  startIfTrueValue(): void {
    if (!this.groupBuilder) throw `Cannot parse if, no Group set!`;
    this.groupBuilder.startIfTrueValue();
  }

  /**
   * Starts the false value Expressions for the if.
   */
  startIfFalseValue(): void {
    if (!this.groupBuilder) throw `Cannot parse if, no Group set!`;
    this.groupBuilder.startIfFalseValue();
  }

  /**
   * Creates result for math expressions when parser finds ending of a Dice function.
   */
  createDice(): void {
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    const dice = this.mathBuilder.create('Dice');
    if (dice) this.groupBuilder.addExpression(dice);
  }

  /**
   * Creates result for math expressions when parser finds ending of a Dice function.
   */
  createCalc(): void {
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    const calc = this.mathBuilder.create('Calc');
    if (calc) this.groupBuilder.addExpression(calc);
  }

  /**
   * Creates While loop expression and adds to current group.
   */
  createWhile(): void {
    if (!this.groupBuilder) throw `Cannot create While without defined Group!`;
    const whileExpression = this.groupBuilder.createWhile();
    this.groupBuilder.addExpression(whileExpression);
  }

  /**
   * Creates loop expressions adds to current group.
   */
  createLoop(): void {
    if (!this.groupBuilder) throw `Cannot create Loop without defined Group!`;
    const loop = this.groupBuilder.createLoop();
    this.groupBuilder.addExpression(loop);
  }

  /**
   * Creates select expressions adds to current group.
   */
  createSelect(): void {
    if (!this.groupBuilder) throw `Cannot create Select without defined Group!`;
    const select = this.groupBuilder.createSelect();
    this.groupBuilder.addExpression(select);
  }

  /**
   * Creates if expression and adds to current group.
   */
  createIf(): void {
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    const ifExpression = this.groupBuilder.createIf();
    this.groupBuilder.addExpression(ifExpression);
  }

  /**
   * Creates logical expression for "Or", "And" or "Xor".
   */
  createLogicalExpression(): void {
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    const logical = this.groupBuilder.createLogicalExpression();
    this.groupBuilder.addExpression(logical);
  }

  /**
   * Starts the next boolean expression for Boolean functions, separated by ",".
   */
  startNextBooleanExpression(): void {
    if (!this.groupBuilder) throw `Cannot parse boolean expression without defined Group!`;
    this.groupBuilder.startNextBooleanExpression();
  }

  /**
   * Creates a new Group Call Expression that takes a defined GroupCallModifier into account.
   * @param table to create a Group call for, may be undefined, then this table is used.
   * @param group to call.
   */
  createGroupCall(table: string, group: string): void {
    const modifier = this.groupCallModifier ? this.groupCallModifier : GroupCallModifierTerm.createUnmodified();
    this.groupCallModifier = undefined;
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    this.groupBuilder.addExpression(new TSGroupCallExpression(table, group, modifier));
  }

  /**
   * Prepares a group call by setting up potential modifications.
   * @param modifierType can be "=" for a fixed result or "+" / "-" for a modification of roll.
   * @param modifier to add to roll, or if fixed result the result to use.
   */
  addGroupCallModifier(modifierType: string, modifier: number): void {
    let result;
    switch (modifierType) {
      case '=':
        result = GroupCallModifierTerm.createFixedValue(new IntTerm(modifier));
        break;
      case '+':
        result = GroupCallModifierTerm.createPlus(new IntTerm(modifier));
        break;
      case '-':
        result = GroupCallModifierTerm.createMinus(new IntTerm(modifier));
        break;
      default:
        throw `Unknown modifier type '${modifierType}'`;
    }
    this.groupCallModifier = result;
  }

  /**
   * Creates a new TSExpression to get value for variable.
   * @param tablename the tablename to get variable from or undefined if it was not provided.
   * @param variablename to get from expression.
   */
  createVariableGet(tablename: string | undefined, variablename: string) {
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    this.groupBuilder.addExpression(new TSVariableGetExpression(tablename, variablename));
  }

  /**
   * Creates a new TSExpression to set value for variable.
   * @param tablename the tablename to set variable to or undefined if it was not provided.
   * @param variablename to set from expression.
   * @param type the type of the set operation.
   */
  createVariableSet(tablename: string | undefined, variablename: string, type: string) {
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    this.groupBuilder.addExpression(new TSVariableSetExpression(tablename, variablename, type));
  }

  /**
   * Creates a new TSExpression for given text.
   * @param text to create simple TSExpression for.
   */
  createText(text: string): void {
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    this.groupBuilder.addExpression(new TSTextExpression(text));
  }

  /**
   * Creates a new TSExpression for bold text.
   * @param text to create bold TSExpression for.
   * @returns TSTextExpression for given text.
   */
  createBold(text: string): void {
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    this.groupBuilder.addExpression(new TSBoldExpression(text));
  }

  /**
   * Creates a Line separator for values.
   * @param align of separator, should be "left", "center" or "right"
   * @param width in percent, int between 1-100
   */
  createLastRoll(): void {
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    this.groupBuilder.addExpression(new TSLastRollExpression());
  }

  /**
   * Creates a Line separator for values.
   * @param align of separator, should be "left", "center" or "right"
   * @param width in percent, int between 1-100
   */
  createLine(align: 'left' | 'center' | 'right', width = 100): void {
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    this.groupBuilder.addExpression(new TSLineExpression(align, width));
  }

  /**
   * Creates a new line expression.
   */
  createNewline(): void {
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    this.groupBuilder.addExpression(new TSNewlineExpression());
  }
}

export default TSParserFactory;
