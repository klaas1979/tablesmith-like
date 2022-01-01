import Term from '../expressions/terms/term';
import IntTerm from '../expressions/terms/intterm';
import TSExpression from '../expressions/tsexpression';
import TSTextExpression from '../expressions/tstextexpression';
import PlusTerm from '../expressions/terms/plusterm';
import InnerDiceTerm from '../expressions/terms/innerdiceterm';
import DiceCalcTerm from '../expressions/terms/dicecalcterm';
import MinusTerm from '../expressions/terms/minusterm';
import TSTermExpression from '../expressions/tstermexpression';
import MultTerm from '../expressions/terms/multterm';
import DivTerm from '../expressions/terms/divterm';
import BracketTerm from '../expressions/terms/bracketterm';
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
type TermCreator = (a: Term, b: Term) => Term;

let debugParsing = '';
function debugText(text: string) {
  debugParsing += text + '\n';
}

/**
 * Context for colleting parsing data of Math Terms, to create the resulting Expression from.
 */
class MathTermContext {
  terms: Array<Term | undefined>;
  termCreators: Array<TermCreator | undefined>;
  groupCallModifier: GroupCallModifierTerm | undefined;
  constructor() {
    this.terms = [];
    this.termCreators = [];
  }
}

/**
 * Factory used by the Peggy Parser to create the in memory representaion of a Tablesmith Table file.
 */
class TSParserFactory {
  table: TSTable;
  groupBuilder: TSTableGroupBuilder | undefined;
  mathTermContexts: MathTermContext[];
  context: MathTermContext;

  ifFunctionNames: string[];
  ifOperators: string[];
  constructor(table: TSTable) {
    this.table = table;
    this.mathTermContexts = [];
    this.context = new MathTermContext();
    this.ifOperators = [];
    this.ifFunctionNames = [];
  }

  getDebugText(): string {
    return debugParsing;
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
    this.groupBuilder = new TSTableGroupBuilder(group);
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
   * Stacks given operator to If operator stack.
   * @param operator to stack in context for later retrieval.
   */
  stackIfOperator(operator: string) {
    debugText('stackIfOperator');
    this.ifOperators.push(operator);
  }

  stackIfFuntionName(functionName: string) {
    debugText('stackIfFuntionName');
    this.ifFunctionNames.push(functionName);
  }
  /**
   * Adds a new expression context to stack for nested expressions. The expression context is popped, whenever create
   * is called.
   */
  stackExpressionContext() {
    debugText('stackExpressionContext');
    this.mathTermContexts.push(this.context);
    this.context = new MathTermContext();
  }

  /**
   * Unstacks the expression context for nested Expression parsing.
   */
  unstackExpressionContext() {
    debugText('unstackExpressionContext');
    const lastContext = this.mathTermContexts.pop();
    if (!lastContext) throw 'Unstacked ExpressionContext is undefined, cannot unstack!';
    this.context = lastContext;
  }

  /**
   * Checks if Context is stacked.
   * @returns boolean true if at least one context is stacked, false if no stacked context exists.
   */
  isExpressionContextStacked(): boolean {
    return this.mathTermContexts.length > 0;
  }

  /**
   * Creates result for math expressions when parser finds ending of a Dice function.
   */
  createDice(): void {
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    const dice = this.create('Dice');
    if (dice) this.groupBuilder.addExpression(dice);
  }

  /**
   * Creates result for math expressions when parser finds ending of a Dice function.
   * @returns TSExpression for current math term Dice.
   */
  createCalc(): void {
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    const calc = this.create('Calc');
    if (calc) this.groupBuilder.addExpression(calc);
  }

  /**
   * Creates result for math expressions when parser finds ending of a Dice or Calc, pops current expression context.
   * @param functionName the Tablesmith function the created term represents.
   * @returns TSExpresion for current math term.
   */
  private create(functionName: string): TSExpression | undefined {
    debugText('create');
    let result;
    const term = this.createTermForContext(functionName);
    this.unstackExpressionContext();
    if (this.isExpressionContextStacked()) {
      this.context.terms.push(term);
    } else {
      result = new TSTermExpression(term);
    }
    return result;
  }

  /**
   * Creates result for math expressions when parser finds ending of a Dice or Calc, pops current expression context.
   * @param functionName the Tablesmith function the created term represents.
   * @returns TSExpresion for current math term.
   */
  private createIf(): TSExpression | undefined {
    debugText('createIf');
    return undefined;
    // let result;
    // const falseVal = this.context;
    // this.unstackExpressionContext();
    // const trueVal = this.context;
    // this.unstackExpressionContext();
    // const ifExpression2 = this.context;
    // this.unstackExpressionContext();
    // const ifExpression1 = this.context;
    // this.unstackExpressionContext();
    // const operator = this.ifOperators.pop();
    // const functionName = this.ifFunctionNames.pop();
    //return new TSIfExpression(functionName, ifExpression1, operator, ifExpression2, trueVal, falseVal);
  }

  /**
   * Create the term that includes all terms of this context.
   * @param functionName the Tablesmith function the created term represents.
   * @returns Term the single Term that combines all parsed Terms for the context.
   */
  private createTermForContext(functionName: string): Term {
    debugText('createTermForContext');
    let termCreator = this.context.termCreators.pop();
    while (termCreator) {
      const termB = this.context.terms.pop();
      const termA = this.context.terms.pop();
      if (!termA || !termB) throw 'Cannot create TSExpression missing terms got a=${termA} b=${termB}';
      this.context.terms.push(termCreator(termA, termB));
      termCreator = this.context.termCreators.pop();
    }
    const term = this.context.terms.pop();
    if (!term) throw 'No term defined, cannot create!';
    debugText('term=' + term.getTerm());
    return new DiceCalcTerm(functionName, term);
  }

  /**
   * Called by parser if variable reference is found in a Term.
   */
  addVariableGet(tablename: string | undefined, variablename: string): void {
    debugText('addVariableGet');
    const variableTerm = new TSVariableGetExpression(tablename, variablename);
    const term = this.context.terms.pop();
    const termCreator = this.context.termCreators.pop();
    if (term && termCreator) {
      this.context.terms.push(termCreator(term, variableTerm));
    } else {
      this.context.terms.push(variableTerm);
    }
  }

  /**
   * Called by parser if number has been found for a Term.
   * @param int the number that has been parsed.
   */
  addNumber(int: number): void {
    debugText('addNumber');
    const intTerm = new IntTerm(int);
    const term = this.context.terms.pop();
    const termCreator = this.context.termCreators.pop();
    if (term && termCreator) {
      this.context.terms.push(termCreator(term, intTerm));
    } else {
      this.context.terms.push(intTerm);
    }
  }

  /**
   * Called by parser if opening bracket has been found in Math Terms.
   */
  openBracket(): void {
    debugText('openBracket');
    this.context.terms.push(undefined);
    this.context.termCreators.push(undefined);
  }

  /**
   * Called by parser if closing bracket for math Term has been found.
   */
  closeBracket() {
    debugText('closeBracket');
    const term = this.context.terms.pop();
    if (term) {
      this.context.terms.push(new BracketTerm(term));
    } else {
      this.context.terms.push(undefined);
    }
  }

  /**
   * Called by parser if addtion found for a math Term.
   */
  addAddition() {
    debugText('addAddition');
    this.context.termCreators.push((a: Term, b: Term): Term => {
      return new PlusTerm(a, b);
    });
  }

  /**
   * Called by parser if subtraction found for a math Term.
   */
  addSubtraction() {
    debugText('addSubtraction');
    this.context.termCreators.push((a: Term, b: Term): Term => {
      return new MinusTerm(a, b);
    });
  }

  /**
   * Called by parser if multiplication found for a math Term.
   */
  addMultiplication() {
    debugText('addMultiplication');
    this.context.termCreators.push((a: Term, b: Term): Term => {
      return new MultTerm(a, b);
    });
  }

  /**
   * Called by parser if division found for a math Term.
   */
  addDivision() {
    debugText('addDivision');
    this.context.termCreators.push((a: Term, b: Term): Term => {
      return new DivTerm(a, b);
    });
  }

  /**
   * Called by parser if dice definition found for a math Term.
   */
  addDice() {
    debugText('addDice');
    this.context.termCreators.push((a: Term, b: Term): Term => {
      return new InnerDiceTerm(a, b);
    });
  }

  /**
   * Creates a new Group Call Expression that takes a defined GroupCallModifier into account.
   * @param table to create a Group call for, may be undefined, then this table is used.
   * @param group to call.
   */
  createGroupCall(table: string, group: string): void {
    debugText('groupCall');
    const modifier = this.context.groupCallModifier
      ? this.context.groupCallModifier
      : GroupCallModifierTerm.createUnmodified();
    this.context.groupCallModifier = undefined;
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    this.groupBuilder.addExpression(new TSGroupCallExpression(table, group, modifier));
  }

  /**
   * Prepares a group call by setting up potential modifications.
   * @param modifierType can be "=" for a fixed result or "+" / "-" for a modification of roll.
   * @param modifier to add to roll, or if fixed result the result to use.
   */
  addGroupCallModifier(modifierType: string, modifier: number): void {
    debugText('addGroupCallModifier');
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
    this.context.groupCallModifier = result;
  }

  /**
   * Creates a new TSExpression to get value for variable.
   * @param tablename the tablename to get variable from or undefined if it was not provided.
   * @param variablename to get from expression.
   */
  createVariableGet(tablename: string | undefined, variablename: string) {
    debugText('createVariableGet');
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
    debugText('createVariableGet');
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    this.groupBuilder.addExpression(new TSVariableSetExpression(tablename, variablename, type));
  }

  /**
   * Creates a new TSExpression for given text.
   * @param text to create simple TSExpression for.
   */
  createText(text: string): void {
    debugText('createText');
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    this.groupBuilder.addExpression(new TSTextExpression(text));
  }

  /**
   * Creates a new TSExpression for bold text.
   * @param text to create bold TSExpression for.
   * @returns TSTextExpression for given text.
   */
  createBold(text: string): void {
    debugText('createBold');
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    this.groupBuilder.addExpression(new TSBoldExpression(text));
  }

  /**
   * Creates a Line separator for values.
   * @param align of separator, should be "left", "center" or "right"
   * @param width in percent, int between 1-100
   */
  createLastRoll(): void {
    debugText('createLastRoll');
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    this.groupBuilder.addExpression(new TSLastRollExpression());
  }

  /**
   * Creates a Line separator for values.
   * @param align of separator, should be "left", "center" or "right"
   * @param width in percent, int between 1-100
   */
  createLine(align: 'left' | 'center' | 'right', width = 100): void {
    debugText('createLine');
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    this.groupBuilder.addExpression(new TSLineExpression(align, width));
  }

  /**
   * Creates a new line expression.
   */
  createNewline(): void {
    debugText('createNewline');
    if (!this.groupBuilder) throw `Cannot create Expression without defined Group!`;
    this.groupBuilder.addExpression(new TSNewlineExpression());
  }
}

export default TSParserFactory;
