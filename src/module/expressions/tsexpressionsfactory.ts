import Term from './term';
import IntTerm from './intterm';
import TSExpression from './tsexpression';
import TSTextExpression from './tstextexpression';
import PlusTerm from './plusterm';
import InnerDiceTerm from './innerdiceterm';
import DiceCalcTerm from './dicecalcterm';
import MinusTerm from './minusterm';
import TSTermExpression from './tstermexpression';
import MultTerm from './multterm';
import DivTerm from './divterm';
import BracketTerm from './bracketterm';
import GroupCallModifierTerm from './groupcallmodifierterm';
import TSGroupCallExpression from './tsgroupcallexpression';
import TSNewlineExpression from './tsnewlineexpression';
import TSBoldExpression from './tsboldexpression';
import TSLineExpression from './tslineexpression';
import TSLastRollExpression from './tslastrollexpression';
import TSVariableGetExpression from './tsvariablegetexpression';
type TermCreator = (a: Term, b: Term) => Term;

let debugParsing = '';
function debugText(text: string) {
  debugParsing += text + '\n';
}

/**
 * Context for Expression parsing collecting data.
 */
class ExpressionContext {
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
class TSExpressionFactory {
  expressionContexts: ExpressionContext[];
  context: ExpressionContext;
  constructor() {
    this.expressionContexts = [];
    this.context = new ExpressionContext();
  }

  getDebugText(): string {
    return debugParsing;
  }

  /**
   * Adds a new expression context to stack for nested expressions. The expression context is popped, whenever create
   * is called.
   */
  stackExpressionContext() {
    debugText('stackExpressionContext');
    this.expressionContexts.push(this.context);
    this.context = new ExpressionContext();
  }

  /**
   * Unstacks the expression context for nested Expression parsing.
   */
  unstackExpressionContext() {
    debugText('unstackExpressionContext');
    const lastContext = this.expressionContexts.pop();
    if (!lastContext) throw 'Unstacked ExpressionContext is undefined, cannot unstack!';
    this.context = lastContext;
  }

  /**
   * Checks if Context is stacked.
   * @returns boolean true if at least one context is stacked, false if no stacked context exists.
   */
  isExpressionContextStacked(): boolean {
    return this.expressionContexts.length > 0;
  }

  /**
   * Creates result for math expressions when parser finds ending of a Dice function.
   * @returns TSExpression for current math term Dice.
   */
  private createDice(): TSExpression | undefined {
    return this.create('Dice');
  }

  /**
   * Creates result for math expressions when parser finds ending of a Dice function.
   * @returns TSExpression for current math term Dice.
   */
  private createCalc(): TSExpression | undefined {
    return this.create('Calc');
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
   * @returns GroupCallExpression for provided values and posible modifier.
   */
  groupCall(table: string, group: string): TSGroupCallExpression {
    debugText('groupCall');
    const modifier = this.context.groupCallModifier
      ? this.context.groupCallModifier
      : GroupCallModifierTerm.createUnmodified();
    this.context.groupCallModifier = undefined;
    return new TSGroupCallExpression(table, group, modifier);
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
   * @returns Variable Get expression for this table.
   */
  createVariableGet(tablename: string | undefined, variablename: string): TSVariableGetExpression {
    debugText('createVariableGet');
    return new TSVariableGetExpression(tablename, variablename);
  }

  /**
   * Creates a new TSExpression for given text.
   * @param text to create simple TSExpression for.
   * @returns TSTextExpression for given text.
   */
  createText(text: string): TSTextExpression {
    debugText('createText');
    return new TSTextExpression(text);
  }

  /**
   * Creates a new TSExpression for bold text.
   * @param text to create bold TSExpression for.
   * @returns TSTextExpression for given text.
   */
  createBold(text: string): TSBoldExpression {
    debugText('createBold');
    return new TSBoldExpression(text);
  }

  /**
   * Creates a Line separator for values.
   * @param align of separator, should be "left", "center" or "right"
   * @param width in percent, int between 1-100
   * @returns TSLineExpression for given values.
   */
  createLastRoll(): TSLastRollExpression {
    debugText('createLastRoll');
    return new TSLastRollExpression();
  }

  /**
   * Creates a Line separator for values.
   * @param align of separator, should be "left", "center" or "right"
   * @param width in percent, int between 1-100
   * @returns TSLineExpression for given values.
   */
  createLine(align: 'left' | 'center' | 'right', width = 100): TSLineExpression {
    debugText('createLine');
    return new TSLineExpression(align, width);
  }

  /**
   * Creates a new line expression.
   * @returns An expression evaluating to a new line.
   */
  createNewline(): TSExpression {
    debugText('createNewline');
    return new TSNewlineExpression();
  }
}

export default TSExpressionFactory;
