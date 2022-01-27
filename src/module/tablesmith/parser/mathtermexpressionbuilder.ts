import BracketTerm from '../expressions/terms/bracketterm';
import DiceCalcTerm from '../expressions/terms/dicecalcterm';
import DivTerm from '../expressions/terms/divterm';
import InnerDiceTerm from '../expressions/terms/innerdiceterm';
import IntTerm from '../expressions/terms/intterm';
import MinusTerm from '../expressions/terms/minusterm';
import MultTerm from '../expressions/terms/multterm';
import PlusTerm from '../expressions/terms/plusterm';
import Term from '../expressions/terms/term';
import TSExpression from '../expressions/tsexpression';
import TSTermExpression from '../expressions/tstermexpression';
import TSTextExpression from '../expressions/tstextexpression';
import TSVariableGetExpression from '../expressions/tsvariablegetexpression';
import Stack from './stack';

type TermCreator = (a: Term, b: Term) => Term;

/**
 * Context for colleting parsing data of Math Terms, to create the resulting Expression from.
 */
class MathTermContext {
  terms: Array<Term | undefined>;
  termCreators: Array<TermCreator | undefined>;
  constructor() {
    this.terms = [];
    this.termCreators = [];
  }
}

/**
 * Builder for Expressions that are based on Math terms used for TS Functions Dice and Calc.
 */
class MathTermExpressionBuilder {
  mathTermContexts: MathTermContext[];
  context: MathTermContext;
  stack: Stack | undefined;

  constructor() {
    this.mathTermContexts = [];
    this.context = new MathTermContext();
  }

  /**
   * Sets the stack to retrieve expressions from when Term Stack is exhausted.
   * @param stack to get expressions from.
   */
  setStack(stack: Stack): void {
    this.stack = stack;
  }

  /**
   * Returns stack or throws if not defined.
   * @param stack to get expressions from.
   */
  getStack(): Stack {
    if (!this.stack) throw 'Stack is undefined, cannot return!';
    return this.stack;
  }

  /**
   * Creates result for math expressions when parser finds ending of a Dice or Calc, pops current expression context.
   * @param functionName the Tablesmith function the created term represents.
   * @returns TSExpresion for current math term.
   */
  create(functionName: string): TSExpression | undefined {
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
    let termCreator = this.context.termCreators.pop();
    while (termCreator) {
      const termB = this.context.terms.pop();
      const termA = this.context.terms.pop();
      if (!termA || !termB) throw `Cannot create Term missing terms got a=${termA} b=${termB}`;
      this.context.terms.push(termCreator(termA, termB));
      termCreator = this.context.termCreators.pop();
    }
    const term = this.context.terms.pop();
    if (!term) throw 'No term defined, cannot create!';
    return new DiceCalcTerm(functionName, term);
  }

  /**
   * Adds a new expression context to stack for nested expressions. The expression context is popped, whenever create
   * is called.
   */
  stackExpressionContext() {
    this.mathTermContexts.push(this.context);
    this.context = new MathTermContext();
  }

  /**
   * Unstacks the expression context for nested Expression parsing.
   */
  unstackExpressionContext() {
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
   * Called by parser if variable reference is found in a Term.
   */
  addVariableGet(tablename: string | undefined, variablename: string): void {
    const tableVarNameExpression = new TSTextExpression(tablename ? `${tablename}.${variablename}` : variablename);
    const variableTerm = new TSVariableGetExpression(tableVarNameExpression);
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
    this.context.terms.push(undefined);
    this.context.termCreators.push(undefined);
  }

  /**
   * Called by parser if closing bracket for math Term has been found.
   */
  closeBracket() {
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
    this.context.termCreators.push((a: Term, b: Term): Term => {
      return new PlusTerm(a, b);
    });
  }

  /**
   * Called by parser if subtraction found for a math Term.
   */
  addSubtraction() {
    this.context.termCreators.push((a: Term, b: Term): Term => {
      return new MinusTerm(a, b);
    });
  }

  /**
   * Called by parser if multiplication found for a math Term.
   */
  addMultiplication() {
    this.context.termCreators.push((a: Term, b: Term): Term => {
      return new MultTerm(a, b);
    });
  }

  /**
   * Called by parser if division found for a math Term.
   */
  addDivision() {
    this.context.termCreators.push((a: Term, b: Term): Term => {
      return new DivTerm(a, b);
    });
  }

  /**
   * Called by parser if dice definition found for a math Term.
   */
  addDice() {
    this.context.termCreators.push((a: Term, b: Term): Term => {
      return new InnerDiceTerm(a, b);
    });
  }
}

export default MathTermExpressionBuilder;
